'use strict';

import IOptions from "./libs/interfaces/IOptions";
import { IWSMessageBumbleAnalysisProfile, WSMesageSource, WSMessageType } from "./libs/interfaces/IWSMessage";
import { generateRandomInt, generateSwipeAction, getRandomDelay, timer } from "./libs/utils/generateRandom";
import BumbleProfilesService  from "./libs/services/BumbleProfilesServices";
import { BumbleProfile } from "./db/documents/BumbleProfiles";
const path = require('path');

const puppeteer = require('puppeteer');

const libsIcon = require('./libs/iconDownloader');

import {getWSClients} from "./server";

export const bumbleBotSwipe = async (numberOfSwipe: any, credentials: AccountCredentials, /*clients:any,*/ subKey:any, shareSubKeyHash:any, DbClient:any): Promise<any> => {
    console.log("Starting bumble bot swapper ...");

    // If in request we received some connections and key, so 
    // shared or personnal key, use it to find the connection in ws and send the analysis data step by step (profile one by one)
    // else nominal behavior, retrieve analysis at the end only

    const browser = await puppeteer.launch({ headless: false, executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1280,
        deviceScaleFactor: 1,
    });
    await page.goto('https://bumble.com/');
    await page.click('a[class="button button--block js-event-link"]');
    await page.waitForTimeout(2000)
    const btnLoginFb = await page.waitForSelector('#main > div > div.page__layout > div.page__content > main > div > div.registration__form > form > div:nth-child(1) > div > div:nth-child(2) > div', { visible: true })
    btnLoginFb.click();

    const newPagePromise = new Promise(x => browser.once('targetcreated', (target: any) => x(target.page())));
    const popup: any = await newPagePromise;
    const acceptCookies = await popup.waitForSelector('button[data-testid="cookie-policy-dialog-accept-button"]')
    acceptCookies.click();
    await popup.$eval("#email", (el: any, credentials: AccountCredentials) => el.value = credentials.login, credentials);
    await popup.$eval("#pass", (el: any, credentials: AccountCredentials) => el.value = credentials.password, credentials);
    await popup.waitForTimeout(4000)
    await popup.click('input[type="submit"]');


    // Waiting for page fully loaded
    await page.waitForTimeout(15000);


    // Loop is schedule
    // on donne l'heure de fin et ça loop tant que l'heure de fin de correspond pas (dans la limite du raisonable)
    // Todo faking time itnerval between each call 
    // Todo faking action 

    console.log(`Total swipe expected : ${numberOfSwipe}`);


    let collectedProfiles: any[] = [];
    for (let i = 0; i < parseInt(numberOfSwipe); i++) {
        console.log(` > Swipe : ${i}`);
        let delay = getRandomDelay(9e3, 20e3);




        /**
         * Get interessting content
         */

        const profile = {
            "name": "",
            "age": "",
            "description": "",
            "proTitle": "",
            "citiesInfo": "",
            "cityDistance": {
                "km": "",
                "from": "Issy-les-Moulineaux"
            },
            "liveIn": "",
            "from": "",
            "hobbies": [] as Array<any>,
            "musics": [] as Array<any>,
            "createdAt": "",
            "updatedAt": "",
            "subKeyUsed": "",
            "subSharedKeyUsed": ""
        }

        try {
            profile.name = await page.$eval("span.encounters-story-profile__name", (elem: any) => elem.innerText)
        } catch (e) {
        }
        try {
            profile.age = await page.$eval("span.encounters-story-profile__age", (elem: any) => elem.innerText)
            profile.age = profile.age.substring(2)
        } catch (e) {

        }
        try {
            profile.description = await page.$eval("div.encounters-album__stories-container > div:nth-child(2) > article > div > section > div > p", (elem: any) => elem.innerText);
        } catch (e) {

        }
        try {
            profile.proTitle = await page.$eval("#main > div > div.page__layout > main > div.page__content-inner > div > div > span > div:nth-child(1) > article > div.encounters-album__stories-container > div:nth-child(1) > article > div:nth-child(2) > section > div > div > p", (elem: any) => elem.innerText);
        } catch (e) {

        }
        try {
            profile.cityDistance.km = await page.$eval("div.location-widget__distance > span", (elem: any) => elem.innerText);
        } catch (e) {
        }

        try {
            profile.citiesInfo = await page.$eval("div.location-widget__town > span", (elem: any) => elem.innerText);
        } catch (e) {
        }

        try {
            let liveIn = await page.$eval("div.location-widget__info > div > div > div > div", (elem: any) => elem.innerText);
             // remove emotji (broken char)
             if ( liveIn ) {
                let cleaned = liveIn.split("à")[1]
                profile.liveIn = cleaned;
             }
        } catch (e) {
        }

        try {
            let from = await page.$eval("div.location-widget__info > div:nth-child(2) > div > div > div", (elem: any) => elem.innerText);
            if ( from ) {
                let splited = from.split("De")[1]  // remove emotji (broken char)
                profile.from = splited;
            }
        } catch (e) {
        }

        try {
           profile.hobbies = await page.$$eval("div.pill__image-box > img", (e: any) => e.map((img: any) => {
                if (img) {

                    let tmp = img.src.split("/")
                    let namize = tmp[tmp.length - 1].split("_")
                    let name = namize[namize.length - 1].split(".")[0].replace(/v2/g,"")
                    return {
                        "src": img.src,
                        "alt": img.alt,
                        name 
                    }
                }
            }));
        } catch (e) {
            console.log(e);
        }

        try {
            // div.spotify-widget__artist-name
            // div.spotify-widget__artist-photo
            let musics = [] as Array<any>;

            let artistNames = await page.$$eval("div.spotify-widget__artist-name", (e: any) => e.map((artist: any) => {
                if ( artist ) {
                    if ( artist.innerText ) {
                        return artist.innerText
                    }
                }
            }));

            let artistPhotos = await page.$$eval("div.spotify-widget__artist-photo > img", (e: any) => e.map((photo: any) => {
                if ( photo ) {
                    if ( photo.src ) {
                        return photo.src
                    }
                }
            }));

            if (artistNames.length > 0 && artistPhotos.length > 0 ) {
                if ( artistNames.length === artistPhotos.length ) {
                    artistNames.map( (name:any, i:any) => {
                        musics = [...musics, {
                            artistName: name,
                            artistPhotoUrl: artistPhotos[i]
                        }]
                    });

                    profile.musics = musics;
                }
            }

        } catch (e){
            
        }


        console.log(`== PROFILE ${profile.name} ==`)
        console.log(` > age : ${profile.age}`)
        console.log(` > Description : ${profile.description}`)
        console.log(` > Pro (with): ${profile.proTitle}`)
        console.log(` > Cities : ${profile.citiesInfo}`)
        console.log(` > LivIn : ${profile.liveIn} `)
        console.log(` > From : ${profile.from} `)
        console.log( " > Hobbies : ", profile.hobbies)
        console.log(" > Musics : ", profile.musics)

        console.log(` > Delay : ${delay} ms`);

        profile.subKeyUsed = subKey;
        profile.subSharedKeyUsed = shareSubKeyHash;
        console.log("start insert profile ...")
        const resp = await BumbleProfilesService.saveProfile(profile, DbClient);
        
        console.log(resp);

        
    let socketsTargetName:any = null;
    let clients = getWSClients();
    console.log("CLIENT GIVEN ?")
    console.log(Object.keys(clients.sockets).length);
    
    if ( subKey ) {
        console.log("hash key send ...")
        if (clients.sockets) {
            console.log("WS clients detected ...")
            let clientsNames = Object.keys(clients.sockets);
            let filtered = clientsNames.filter(clientName => clientName.split("::")[1] === subKey || clientName.split("::")[2] === subKey);
            if ( filtered.length > 0 ) {
                console.log("Client for following key : ");
                console.log("subKey :",subKey)
                console.log("sharedKey :",shareSubKeyHash)
                console.log("NUMBER SIMILAR SOCKETS ", filtered)
                socketsTargetName = filtered;
            } else {
                    console.log("No client found for this hashkey (shared or personnal) ");
                }
            }
        } else {
            console.log("Ignore WS, no key provided.");
        }

        if ( socketsTargetName !== null ) {
            console.log("Send profile to socket");
            console.log("key : ", subKey)
            console.log("sharedKey : ", shareSubKeyHash)
            console.log("TOTAL WS CLIENTS", Object.keys(clients.sockets).length);
            
            socketsTargetName.map( (socketName:string) => {
                console.log("send to ", socketName);
                clients.sockets[socketName].send(JSON.stringify(<IWSMessageBumbleAnalysisProfile>{"source": WSMesageSource.BUMBLE_WEB, "type": WSMessageType.BUMBLE_ANALYSIS_ROFILE,"subKey": subKey, "subSharedKey": shareSubKeyHash,...profile}));
            })
        }


        await timer(delay);
        let { name } = generateSwipeAction(true); // generate only NO swipe -avoid shitty modal-
        console.log(` > Generated swipe action : ${name}`);
        profile.updatedAt = new Date().toISOString();
        profile.createdAt = new Date().toISOString();
        collectedProfiles = [...collectedProfiles, profile];
        await page.keyboard.press(name);
        
    }

    console.log("Profiles collected with success, stop the bot ...")
    await browser.close();

    return new Promise((resolve, reject) => {
        resolve(collectedProfiles);
    })
}


export const linkedinMessageAnalysis = async (limit: any, credentials: AccountCredentials): Promise<Array<LinkedinMessages>> => {
    // Manage options received
    if (!limit) {
        limit = null
    }


    console.log("Starting  ...")
    const browser = await puppeteer.launch({ headless: false, executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1280,
        deviceScaleFactor: 1,
    });


    page.on('console', (msg: { text: () => any; }) => console.log(msg.text())); // redirect page console log to node

    await page.goto('https://www.linkedin.com/uas/login');

    await page.$eval('#username', (el: any, credentials: AccountCredentials) => el.value = credentials.login, credentials);
    await page.$eval('#password', (el: any, credentials: AccountCredentials) => el.value = credentials.password, credentials);
    await page.waitForTimeout(4000)
    await page.click('button[type="submit"]');

    await page.waitForNavigation()
    await page.waitForTimeout(4000)

    await page.click("[data-test-global-nav-link=messaging]")
    await page.waitForTimeout(4000)

    await page.waitForSelector('li[class^=msg-conversation-listitem]');
    await page.waitForTimeout(4000)


    const tabMsgIds = await page.evaluate(() => {
        const usersTitle = document.querySelectorAll("div[title]");
        let usersTitleFound: any[] = [];

        for (let i in usersTitle) {
            let htmlElement: any = usersTitle[i];
            if (htmlElement) {
                usersTitleFound.push(htmlElement.outerText)
            } else {
                usersTitleFound.push("")
            }
        }
        console.log(usersTitle[0])

        const userNames = document.querySelectorAll(".msg-conversation-listitem__participant-names");
        let usersFound: any[] = [];
        for (let i in userNames) {
            let htmlElement: any = userNames[i];
            if (htmlElement) {
                usersFound.push(htmlElement.innerText)
            } else {
                usersFound.push("")
            }
        }

        const liMessages = document.querySelectorAll("li[class^=msg-conversation-listitem]")
        let collectId: any[] = [];
        for (let i in liMessages) {
            if (liMessages[i].id) collectId.push(liMessages[i].id);
        }



        return new Promise((resolve, reject) => {
            resolve({ "collectIds": collectId, "userNames": usersFound, "userTitles": usersTitleFound })
        })
    });



    async function load(liMessage: any[], usersNames: any[], userTitles: any[], options: IOptions): Promise<any> {

        let limitMsgToParse = options.parseMessagesLimit !== null ? options.parseMessagesLimit : liMessage.length;

        console.log("Parse with options: ")
        console.log(options)

        let completed: any[] = [];
        for (let i = 0; i < limitMsgToParse; i++) {

            // Map user with the corresponding tab message
            await page.click(`li#${liMessage[i]}`);
            console.log(`Looking for ${usersNames[i]} - ${userTitles[0]} messages ... `)

            await timer(2000)
            let messagesContents = await page.$$eval('.msg-s-message-list__event', (msgsContents: any) => msgsContents.map((el: HTMLElement) => el.innerText))


            console.log(`Result : `)
            completed = [...completed, {
                userName: usersNames[i],
                userTitle: userTitles[i],
                messagesSend: messagesContents
            }]
            console.log(completed);


            await timer(2000)
            console.log("--------------------------------------------------")
            console.log("--------------------------------------------------")
            console.log("--------------------------------------------------")

        }

        return new Promise(resolve => {
            resolve(completed);
        })
    }

    console.log("== TAB LOG ==")
    const { collectIds, userNames, userTitles } = tabMsgIds;


    const options: IOptions = {
        parseMessagesLimit: limit
    }
    const completedTask = await load(collectIds, userNames, userTitles, options);
    console.log("Treatement is over");
    console.log(completedTask);
    /*
    tabMsgIds.map( async (id: any) => {
        console.log(id)
       await page.click(`li#${id}`);
       await timer(6000)
    })*/




    /*
  let chatIcon = await page.evaluate( () => {
      console.log("EVALUATE");
      const linkedinChatIconHref = "#global-nav-icon--mercado__messaging--active";

      // avoid shadow root
      let svgUseHref: any[] = [];
      const useQuery: any = document.getElementsByTagName("use");


      let targetIcon: any | null;

      for ( let x in useQuery ) {
          if ( useQuery[x].href === linkedinChatIconHref ) {
              targetIcon = useQuery[x];
          }
      }

      return new Promise( (resolve, reject) => {
          if ( targetIcon !== null ) {
              resolve(targetIcon);
          } else {
              reject("Icon chat not found");
          }
      })

  });
  console.log(chatIcon)
  */


    console.log("End and closing browser")
    await browser.close();
    console.log("browser closed.")

    const dataMessagesList: Array<LinkedinMessages> = completedTask.map((msg: any) => <LinkedinMessages>{ content: msg.messagesSend, username: msg.userName, jobTitle: msg.userTitle, createdAt: new Date().toISOString(), updatedAt: null, parsedByUserEmail: credentials.login })

    //let response = completedTask.map( msg => new LinkedinMessage())

    return new Promise((resolve, reject) => {
        resolve(dataMessagesList);
    })
}




/*
(async () => {

})();*/



/*
(async() => {
    for ( let i = 0; i < 20 ; i++ )  {
    //const browser = await puppeteer.launch({ headless: false }); // default is true
    const browser = await puppeteer.launch({ headless: false, executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });

    const page = await browser.newPage();

    page.on('console', (msg: { text: () => any; }) => console.log(msg.text())); // redirect page console log to node

    await page.setViewport({
        width: 1920,
        height: 1280,
        deviceScaleFactor: 1,
      });


    //await page.goto('https://www.wowhead.com/spell=26656/black-qiraji-battle-tank');

    await page.goto(`https://www.wowhead.com/spell=${i}`);
    await page.waitForTimeout(4500)

    // Since page evaluate execute in the page, ened to pass as param our variables / fucntion
    // code here is evaluate ON THE PAGE !


    let dataIcons = await page.evaluate( () => {
        let logos: any[] = [];

        const iconsQuery: any = document.getElementsByTagName("ins")
        for ( let i = 0; i < iconsQuery.length; i++) {
            logos.push(iconsQuery[i].style.backgroundImage )
        }

        return new Promise( (resolve, reject) => {
            resolve(logos)
        })
    })

    dataIcons.map( async (iconUrlCss: string) => {
        let cleanUrl = iconUrlCss.replace('url("', "").replace('")',"");
        let segmented = cleanUrl.split("/");
        let fileName = segmented[segmented.length - 1];
        console.log(cleanUrl)
        console.log(fileName);
        if ( cleanUrl && fileName ) {
            const downloaded = await libsIcon.downloadIcon(cleanUrl, path.join(__dirname, `../collected/icons/${fileName}`))
            console.log(downloaded);
        }

    });


    }


    //await browser.close();
})();*/