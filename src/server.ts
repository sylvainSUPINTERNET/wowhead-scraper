'use strict';

require('dotenv').config()

let https = require('https');
let fs = require('fs');


import express from 'express';
import {linkedinMessageAnalysis, bumbleBotSwapper} from './main';
import DbClient from "./db/client";
import authentication from './middleware/authentication';
import LinkedinMessagesService from './libs/services/LinkedinMessagesService';

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




app.get('/bot/swapper/bumble', authentication, async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    //@ts-ignore
    let {credentials} = req;
    const dataSwapper = await bumbleBotSwapper(credentials);


    res.status(200).json({ "message" : dataSwapper});
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
  

const httpsServer = https.createServer(options, app);
httpsServer.listen(PORT, () => {
    console.log(`[API] bot start on port : ${PORT}`);
});

