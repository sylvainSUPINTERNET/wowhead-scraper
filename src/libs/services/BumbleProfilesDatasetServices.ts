'use strict';

import fs from "fs";
import * as csv from 'fast-csv';
import { BumbleProfile } from '../../db/documents/BumbleProfiles';

export interface AllowedFormatDataset {
   format: "csv"
}

interface ProfileCsv extends BumbleProfile {
    _id: string;
    cityDistance: {
        km: string,
        from: string
    }
}

interface ProfileCsvCleaned {
    _id: string; // ObjectId mongo
    name: string;
    age: string;
    description:string;
    proTitle: string;
    citiesInfo: string;
    cityDistanceKm: string;
    cityDistanceFrom: string;
    liveIn:string;
    from: any;
    hobbiesName: string; // name
    hobbiesDetails : string; // alt
    musicsArtistName: string; // artistName
    createdAt: string;
    updatedAt: string; 
};

export default {
    convertTo :  async (format: AllowedFormatDataset, mongoClient:any): Promise<any> => {
        const cursorProfiles = await mongoClient.BumbleProfileCollection.find({});

        /*
        cursorProfiles.map( (profile:ProfileCsv) => {
            console.log(profile);
        });*/


        //await cursorProfiles.forEach( (data:any) => console.log(data))
        const profiles: Array<ProfileCsv> = await cursorProfiles.toArray();
        // TODO => sanitize les données

        const csvOutputWritableStreamAndFileName = await csvOutput(profiles);
        console.log("GENERATED")

        return new Promise( (resolve, reject) => {
            resolve(csvOutputWritableStreamAndFileName);
        }) 
    }
}


// Clean data for CSV format (important for prediction model training)
const sanitizeData = (profileToClean: ProfileCsv) : ProfileCsvCleaned => {
    let p = <ProfileCsvCleaned> {}

    if ( profileToClean.cityDistance ) {
        if ( profileToClean.cityDistance.from && profileToClean.cityDistance.km && profileToClean.cityDistance.km != "" && profileToClean.cityDistance.from !== "") {
            // keep these data
            p.cityDistanceFrom = profileToClean.cityDistance.from;
            p.cityDistanceKm = profileToClean.cityDistance.km;   
        }
    }
    p._id = profileToClean._id;
    p.age = profileToClean.age;
    p.description = profileToClean.description;
    p.proTitle = profileToClean.proTitle;
    p.citiesInfo = profileToClean.citiesInfo;
    p.liveIn = profileToClean.liveIn;
    p.from = profileToClean.from;

    let hobbiesNameList: Array<String> = [];
    let hobbiesDetail: Array<String>  = [];
    let artistsList: Array<String> = [];
    profileToClean.hobbies.map( d => { 
        hobbiesNameList = [...hobbiesNameList, d.name]
        hobbiesDetail = [...hobbiesDetail, d.alt]
      });
    p.hobbiesName = hobbiesNameList.join(" ")
    p.hobbiesDetails = hobbiesDetail.join(" ")

    profileToClean.musics.map( d => { 
        artistsList = [...artistsList, d.artistName]
      });
    p.musicsArtistName = artistsList.join(" ")
    p.createdAt = profileToClean.createdAt;
    p.updatedAt = profileToClean.updatedAt;

    return p;
}


const csvOutput  = async (profiles : Array<ProfileCsv>): Promise<any> => {
    // https://nodesource.com/blog/understanding-streams-in-nodejs/
    const csvStream = csv.format({ headers: true });
    
    const fileNameGenerated = new Date().getTime();
    const writable:any = fs.createWriteStream(`./${fileNameGenerated}.csv`)

    profiles.map( (profile:ProfileCsv) => {
        const profileForCsv = sanitizeData(profile)
        csvStream.write(profileForCsv);
    })
    csvStream.end()
    csvStream.pipe(writable).on('end', () =>{process.exit()});
    console.log("CSV OUTPUT PROCESSING")

    return new Promise( (resolve, reject) => {
        resolve({writable, fileNameGenerated})
    })
}