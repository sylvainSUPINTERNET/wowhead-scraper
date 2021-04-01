'use strct';

const fs = require('fs');
const axios = require('axios');

const downloadIcon = async (picUrl: string, filePath: string) : Promise<any> => {
    const iconResponse = await axios.get(picUrl, {responseType: "stream"});
    iconResponse
        .data
        .pipe(fs.createWriteStream(filePath))
        .on('error', (err: any) => {
            return new Promise( (resolve, reject) => {
                reject(err)
            })
        });
    return new Promise( (resolve) => {
        resolve(`${ new Date().toISOString() }> ${filePath} generated`)
    })
}

module.exports = {
     downloadIcon
}

