'use strict';

import { MongoClient } from "mongodb";



export default {
    saveMessage : async (message: Array<LinkedinMessages>, mongoClient: any) : Promise<any> => {
            const resp = await mongoClient.LinkedinMessagesCollection.insert({"test":"hello"})
            return resp;
    }
}