'use strct';

const fs = require('fs');
const axios = require('axios');

// https://stackoverflow.com/questions/12740659/downloading-images-with-node-js
const downloadIcon = async (picUrl: string, dirToSave: string) : Promise<any> => {
    const iconResponse = await axios.get(picUrl, {responseType: "stream"});
    iconResponse.data.pipe(fs.createWriteStream(dirToSave))
}

module.exports = {
     downloadIcon
}

