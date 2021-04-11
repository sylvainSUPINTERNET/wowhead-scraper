'use strict';

import express from "express";

const authentication = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("GET EHADERS");
    console.log(req.headers)
    if ( req.headers.authorization ) {

        if ( req.headers.authorization.split(" ")[1] ) {
            // basic auth
            let credentialsAccount = Buffer.from(req.headers.authorization.split(" ")[1],'base64').toString().split(":");

            //@ts-ignore
            req.credentials = {
                "login":credentialsAccount[0],
                "password":credentialsAccount[1]
            }


            next();
        } else {
            res.status(401).json({
                "status": "Unauthorized",
                "message":"Credentials for your account are missing"
            })
        }

    } else {
        res.status(401).json({
            "status": "Unauthorized",
            "message":"Credentials for your account are missing"
        })
    }

}

export default authentication;