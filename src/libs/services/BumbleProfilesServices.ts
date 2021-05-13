'use strict';

import { BumbleProfile } from "../../db/documents/BumbleProfiles";



export default {
    saveProfiles : async (profiles: Array<BumbleProfile>, mongoClient: any) : Promise<any> => {
            const resp = await mongoClient.BumbleProfileCollection.insertMany(profiles);
            return resp;
    },
    saveProfile : async (profile: BumbleProfile, mongoClient: any) : Promise<any> => {
        const resp = await mongoClient.BumbleProfileCollection.insertOne(profile);
        return resp;
    }
}


