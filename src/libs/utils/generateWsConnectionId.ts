'use strict';

import {createHash} from "crypto";
import { v4 as uuidv4 } from 'uuid';



export const generateConnectionId = () : string=> {
  const hash = createHash('sha256');
  hash.update(uuidv4());
  return hash.copy().digest("hex"); 
}






//import {randomBytes, scrypt} from "crypto";

// https://stackoverflow.com/questions/48094647/nodejs-crypto-in-typescript-file/51958761

//const IV =  Buffer.from("eThWmZq4t7w!z%C*")


// FIND A WAY TO script pour generer une clé 128 bits à partir du mot de passe de l'utilisateur
// ensuite on utilisera une valeur static pour bytes de IV (128 bits)


//const IV = crypto


/*

'use strict';

const crypto = require('crypto');

const phrase = "sylvain.joly00@gmail+kkk";
  const ENC_KEY = crypto.randomBytes(32); // 128 / 192 / 256 bits
  const IV = crypto.randomBytes(16); // 128 bits


var decrypt = ((encrypted) => {
  let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  return (decrypted + decipher.final('utf8'));
});


const encrypt = (data) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return new Promise( (resolve, reject) => {
    resolve(encrypted);
  })
}


let hash = async (phrase) => {
  const d = await encrypt(phrase)
  const de = decrypt(d)
  console.log(de)
  return d
}

let data = hash(phrase)

*/