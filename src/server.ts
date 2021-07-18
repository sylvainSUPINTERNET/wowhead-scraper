'use strict';



require('dotenv').config()

import { v4 as uuidv4 } from 'uuid';

const cors = require('cors');
let https = require('https');
let fs = require('fs');
const webSocketServer = require('websocket').server;

const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./proto/news.proto";
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const newsProto = grpc.loadPackageDefinition(packageDefinition);

import {GetAllNews, Test} from "./grpc/News";

let grpcServer = new grpc.Server();
grpcServer.addService(newsProto.NewsService.service,{
    GetAllNews,
    Test
});



import express from 'express';
import {linkedinMessageAnalysis, bumbleBotSwipe} from './main';
import DbClient from "./db/client";
import authentication from './middleware/authentication';
import LinkedinMessagesService from './libs/services/LinkedinMessagesService';
import BumbleProfilesService from './libs/services/BumbleProfilesServices';
import BumbleProfilesDatasetServices, {AllowedFormatDataset} from './libs/services/BumbleProfilesDatasetServices';
import { generateConnectionId } from './libs/utils/generateWsConnectionId';
import { IWSMessageNewSubBumbleAnalysisProfiles, WSMesageSource, WSMessageType } from './libs/interfaces/IWSMessage';


// WS
let clients = {
    "sockets": <any>{}
};


export const getWSClients = () : any => {
    return clients;
}

const app = express();
const bodyParser = require('body-parser');


// using mkcert
// https://blog.bitsrc.io/using-https-for-local-development-for-react-angular-and-node-fdfaf69693cd
const options = {
    cert: fs.readFileSync('C:\\Users\\Sylvain\\AppData\\Local\\mkcert\\localhost.pem', 'utf8'),
    key:fs.readFileSync('C:\\Users\\Sylvain\\AppData\\Local\\mkcert\\localhost-key.pem', 'utf8'),
}
const PORT = process.env.PORT || 4999;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(cors())
//https://localhost:3000/bot/swapper/bumble/export?key="<key>"
app.get('/bot/swapper/bumble/export', async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    let key = req.query.key;
    if ( key) {
        try {
            const {format} = req.query;
            const allowed = <AllowedFormatDataset>{format};
            const {writable, fileNameGenerated} = await BumbleProfilesDatasetServices.convertTo(allowed, DbClient, key);
            const readable = fs.createReadStream(`./${fileNameGenerated}.csv`);
            fs.unlink(`./${fileNameGenerated}.csv`, (err:any) => {
                if (err) {
                    res
                    .status(400)
                    .json({ "message": "error", "detail": err})
                } else {
                    res.header('Content-Type', 'text/csv');
                    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
                    res.attachment(`${new Date(fileNameGenerated).toISOString()}_analysis.csv`);
                    readable.pipe(res);
                }
            });
    
        } catch (e) {
            res
            .status(400)
            .json({ "message": "error", "detail": e})
        }
    } else {
        res.status(400).json({
            "message":"Invalid key given"
        })
    }
})


// https://localhost:3000/bot/swapper/bumble?numberOfSwipe=20&subKey=1b2a394aabe2f86529f9d84a855ea8a9d72f9f7931001e884a48690d507d1972&sharedKey=
app.get('/bot/swapper/bumble', authentication, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { numberOfSwipe, subKey, sharedKey } = req.query;
    //@ts-ignore
    let {credentials} = req;
    const colllectedProfiles = await bumbleBotSwipe(numberOfSwipe, credentials, subKey, sharedKey, DbClient);
    
    //const resp = await BumbleProfilesService.saveProfiles(colllectedProfiles, DbClient);

    // https://practicalprogramming.fr/mongodb-index
    res.status(200).json({ "profiles" : colllectedProfiles, numberOfSwipe});
})


app.get('/unity/profiles', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const profilesCursor = await DbClient.BumbleProfileCollection.find({});
    const dataProfiles = await profilesCursor.toArray();
    res.status(200).json({"profiles":dataProfiles})
})



// https://localhost:3000/bot?action=analysis&target=messages&where=linkedin&limit=2
app.get('/bot', authentication, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let {where, action, target, limit} = req.query;

    //@ts-ignore
    let {credentials} = req;

    const completed:Array<LinkedinMessages> = await linkedinMessageAnalysis(limit, credentials);

    await LinkedinMessagesService.saveMessage(completed, DbClient)

    res.status(200).json({
        action,
        target,
        where,  
        limit,
        messages: completed
    });
 });



 //https://blog.logrocket.com/websockets-tutorial-how-to-go-real-time-with-node-and-react-8e4693fbf843/

const httpsServer = https.createServer(options, app);
httpsServer.listen(PORT, () => {
    console.log(`[API] bot start on port : ${PORT}`);
});

const wsServer = new webSocketServer({
    httpServer: httpsServer
});

grpcServer.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), () => {
    grpcServer.start();
    console.log("[API] GRPC has started : localhost:50051");
});

console.log("[API] ws is ready")



wsServer.on('request', async (request: any) => {
    let uuid = uuidv4();

     // You can rewrite this part of the code to accept only the requests from allowed origin
     // check this for prod ! => https://www.npmjs.com/package/websocket (not allow all origin !!!)
    const connection = request.accept(null, request.origin);

    // This is connection for synchronization with existing analysis
    if (request.resourceURL.query.key) {
        const subKeyHash = request.resourceURL.query.key ;
        const shareSubKeyHash =  request.resourceURL.query.key;
    
        clients.sockets[`${uuid}::${subKeyHash}::${shareSubKeyHash}%SYNC`] = connection;
        console.log("new client created (synchronize) :" + Object.keys(clients).length);
        // Send key at connection if you need to get back data / sync
        clients.sockets[`${uuid}::${subKeyHash}::${shareSubKeyHash}`].send(JSON.stringify(<IWSMessageNewSubBumbleAnalysisProfiles>{"source": WSMesageSource.BUMBLE_WEB, "type": WSMessageType.NEW_SUB_BUMBLE_ANALYSIS_PROFILES,"subKey": subKeyHash, "subSharedKey": shareSubKeyHash}));
        
    } else {

        // Fresh analysis
        const subKeyHash =  generateConnectionId();
        const shareSubKeyHash =  generateConnectionId();
    
        clients.sockets[`${uuid}::${subKeyHash}::${shareSubKeyHash}`] = connection;
        console.log("new client created (fresh):" + Object.keys(clients).length);
    
        // Send key at connection if you need to get back data / sync
        clients.sockets[`${uuid}::${subKeyHash}::${shareSubKeyHash}`].send(JSON.stringify(<IWSMessageNewSubBumbleAnalysisProfiles>{"source": WSMesageSource.BUMBLE_WEB, "type": WSMessageType.NEW_SUB_BUMBLE_ANALYSIS_PROFILES,"subKey": subKeyHash, "subSharedKey": shareSubKeyHash}));    
    }


    console.log(clients.sockets);


    connection.on('message', async (msg:any) => {
        if ( msg.type === "utf8") {
            console.log(msg);
        }
    })


})


