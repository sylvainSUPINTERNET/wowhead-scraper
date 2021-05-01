'use strict';

import fs from "fs";
import * as csv from 'fast-csv';
import { BumbleProfile } from '../../db/documents/BumbleProfiles';

export interface AllowedFormatDataset {
   format: "csv"
}

interface ProfileCsv extends BumbleProfile {

}


export default {
    convertTo :  async (format: AllowedFormatDataset, mongoClient:any): Promise<any> => {
        const cursorProfiles = await mongoClient.BumbleProfileCollection.find({});
        //await cursorProfiles.forEach( (data:any) => console.log(data))
        const profiles: Array<ProfileCsv> = await cursorProfiles.toArray();

        const csvOutputResult = await csvOutput(profiles);
        console.log("GENERATED")

        return new Promise( (resolve, reject) => {
            resolve(csvOutputResult);
        }) 
    }
}



const csvOutput  = async (profiles : Array<ProfileCsv>): Promise<any> => {
    // https://nodesource.com/blog/understanding-streams-in-nodejs/

    const csvStream = csv.format({ headers: true });
    const writable:any = fs.createWriteStream("./test.csv")

    profiles.map( async profile => {
        csvStream.write(profile);
    })

    csvStream.end()
    csvStream.pipe(writable).on('end', () => process.exit());

    console.log("CSV OUTPUT PROCESSING")

    return new Promise( (resolve, reject) => {
        resolve(writable)
    })
}