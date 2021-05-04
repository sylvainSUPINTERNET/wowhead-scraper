'use strict';



require('dotenv').config()

import { v4 as uuidv4 } from 'uuid';

const cors = require('cors');
let https = require('https');
let fs = require('fs');
const webSocketServer = require('websocket').server;



import express from 'express';
import {linkedinMessageAnalysis, bumbleBotSwipe} from './main';
import DbClient from "./db/client";
import authentication from './middleware/authentication';
import LinkedinMessagesService from './libs/services/LinkedinMessagesService';
import BumbleProfilesService from './libs/services/BumbleProfilesServices';
import BumbleProfilesDatasetServices, {AllowedFormatDataset} from './libs/services/BumbleProfilesDatasetServices';
import { generateConnectionId } from './libs/utils/generateWsConnectionId';

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

app.get('/bot/swapper/bumble/export', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const {format} = req.query;
        const allowed = <AllowedFormatDataset>{format};
        const {writable, fileNameGenerated} = await BumbleProfilesDatasetServices.convertTo(allowed, DbClient);
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

})


// https://localhost:3000/bot/swapper/bumble?numberOfSwipe=2
app.get('/bot/swapper/bumble', authentication, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { numberOfSwipe } = req.query;
    //@ts-ignore
    let {credentials} = req;
    const colllectedProfiles = await bumbleBotSwipe(numberOfSwipe, credentials);
    const resp = await BumbleProfilesService.saveProfile(colllectedProfiles, DbClient);

    // https://practicalprogramming.fr/mongodb-index
    res.status(200).json({ "profiles" : colllectedProfiles, numberOfSwipe});
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
console.log("[API] ws is ready")


let clients = <any>{};

wsServer.on('request', async (request: any) => {
    let uuid = uuidv4();

     // You can rewrite this part of the code to accept only the requests from allowed origin
     // check this for prod ! => https://www.npmjs.com/package/websocket (not allow all origin !!!)
    const connection = request.accept(null, request.origin);
    const subKeyHash =  generateConnectionId();
    const shareSubKeyHash =  generateConnectionId();

    connection.on('message', async (msg:any) => {
        if ( msg.type === "utf8") {
            console.log(msg);
        }
    })

    clients[uuid] = connection;
    console.log("new client created :" + Object.keys(clients).length);
    clients[uuid].send(JSON.stringify({"message":"bumblePoriflesSubscribe", "subKey": subKeyHash, "subSharedKey": shareSubKeyHash}));
    
    /*
    setInterval( () => {
        console.log(Object.keys(clients).length);
    },8000) */
})


