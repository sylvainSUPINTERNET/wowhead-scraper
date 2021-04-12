'use strict';

import { MongoClient } from "mongodb";



export default {
    saveMessage : async (message: Array<LinkedinMessages>, mongoClient: MongoClient) : Promise<any> => {
        return "ok"
    }
}