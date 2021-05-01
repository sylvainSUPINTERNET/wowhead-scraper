'use strict';

require('dotenv').config()

let https = require('https');
let fs = require('fs');


import express from 'express';
import {linkedinMessageAnalysis, bumbleBotSwipe} from './main';
import DbClient from "./db/client";
import authentication from './middleware/authentication';
import LinkedinMessagesService from './libs/services/LinkedinMessagesService';
import BumbleProfilesService from './libs/services/BumbleProfilesServices';
import BumbleProfilesDatasetServices, {AllowedFormatDataset} from './libs/services/BumbleProfilesDatasetServices';

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


app.get('/bot/swapper/bumble/export', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {format} = req.query;
    const allowed = <AllowedFormatDataset>{format};
    const csvWritableResult = await BumbleProfilesDatasetServices.convertTo(allowed, DbClient);
    const readable = fs.createReadStream("./test.csv");
    res.header('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
    res.attachment("analysis_bumble_profiles.csv");
    readable.pipe(res);
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




  

const httpsServer = https.createServer(options, app);
httpsServer.listen(PORT, () => {
    console.log(`[API] bot start on port : ${PORT}`);
});

