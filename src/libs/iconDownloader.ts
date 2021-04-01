'use strct';

const fs = require('fs');
const axios = require('axios');

const downloadIcon = async (picUrl: string, dirToSave: string) : Promise<any> => {
    const iconResponse = await axios.get(picUrl, {responseType: "stream"});
    iconResponse.data.pipe(fs.createWriteStream(dirToSave))
}

module.exports = {
     downloadIcon
}

