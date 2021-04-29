'use strict';

import * as csv from 'fast-csv';
import { BumbleProfile } from '../../db/documents/BumbleProfiles';
const csvStream = csv.format({ headers: true });


interface AllowedFormatDataset {
   format: "csv"
}

interface ProfileCsv extends BumbleProfile {

}


export default {
    convertTo :  async (format: AllowedFormatDataset, mongoClient:any): Promise<any> => {
        const cursorProfiles = await mongoClient.BumbleProfileCollection.find({});
        //await cursorProfiles.forEach( (data:any) => console.log(data))
        const profiles: Array<ProfileCsv> = await cursorProfiles.toArray();

        const csvGenerated = await csvOutput(profiles);

        return new Promise( (resolve, reject) => {
            resolve("CONVERT TEST");
        }) 
    }
}



const csvOutput  = async (profiles : Array<ProfileCsv>): Promise<any> => {
    
    return new Promise( (resolve, reject) => {
        resolve("CSV OUTPUT")
    })
}