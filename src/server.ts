'use strict';

require('dotenv').config()


import express from 'express';
import linkedinMessageAnalysis from './main';
import DbClient from "./db/client";

const app = express();
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

const mongoClient = DbClient.getConnection();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// http://localhost:3000/bot?action=analysis&target=messages&where=linkedin&limit=2
app.get('/bot', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let {where, action, target, limit} = req.query;

    const completed = await linkedinMessageAnalysis(limit);
    console.log(completed);

    res.status(200).json({
        action,
        target,
        where,
        limit,
        completed
    });
 });
  


app.listen( PORT, () => {
    console.log(`[API] bot start on port : ${PORT}`);
})


