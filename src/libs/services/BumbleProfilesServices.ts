'use strict';

import { BumbleProfile } from "../../db/documents/BumbleProfiles";



export default {
    saveProfile : async (profiles: Array<BumbleProfile>, mongoClient: any) : Promise<any> => {
            const resp = await mongoClient.BumbleProfileCollection.insertMany(profiles);
            return resp;
    }
}


