'use strict';

import IOptions from "./libs/interfaces/IOptions";

const path = require('path');

const puppeteer = require('puppeteer');

const libsIcon = require('./libs/iconDownloader');


export const bumbleBotSwapper = async (credentials: AccountCredentials): Promise<any> => {
    console.log("Starting bumble bot swapper ...");

    const browser = await puppeteer.launch({ headless:false, executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1280,
        deviceScaleFactor: 1,
      });
      await page.goto('https://bumble.com/');
      await page.click('a[class="button button--block js-event-link"]');
      await page.waitForTimeout(2000)
      const btnLoginFb = await page.waitForSelector('#main > div > div.page__layout > div.page__content > main > div > div.registration__form > form > div:nth-child(1) > div > div:nth-child(2) > div', {visible: true})
      btnLoginFb.click();

      const newPagePromise = new Promise(x => browser.once('targetcreated', (target:any) => x(target.page()))); 
      const popup:any  = await newPagePromise;
      const acceptCookies = await popup.waitForSelector('button[data-testid="cookie-policy-dialog-accept-button"]')
      acceptCookies.click();
      await popup.$eval("#email", (el: any, credentials: AccountCredentials) => el.value = credentials.login, credentials);
      await popup.$eval("#pass", (el: any, credentials: AccountCredentials) => el.value = credentials.password, credentials);
      await popup.waitForTimeout(4000)
      await popup.click('input[type="submit"]');
      
      console.log("POPUP", popup);
      //await popup.waitForSelector('[name="__CONFIRM__"]')

    //   const [popup]:any = await Promise.all([
    //     new Promise((resolve) => page.once('popup', resolve)),
    //     console.log("NEW MODAL DETECTED"),
    //     page.click('#u_0_8_9J')
    //     //page.click('a[target=_blank]')
    //   ]);


      /*
      const btnFbLoginDiv = await page.$$("div > .button--filled")
      btnFbLoginDiv.click();    
      */

    return new Promise( (resolve, reject) => {
        resolve("Hello World swapper");
    }) 
}


export const linkedinMessageAnalysis = async (limit: any, credentials: AccountCredentials): Promise<Array<LinkedinMessages>> => {
    // Manage options received
    if ( !limit ) {
        limit = null
    }


    console.log("Starting  ...")
    const browser = await puppeteer.launch({ headless:false, executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });
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
        
        for ( let i in usersTitle ) {
            let htmlElement: any = usersTitle[i];
            if ( htmlElement ) {
                usersTitleFound.push(htmlElement.outerText)
            } else {
                usersTitleFound.push("")
            }
        }
        console.log(usersTitle[0])

        const userNames = document.querySelectorAll(".msg-conversation-listitem__participant-names");
        let usersFound: any[] = [];
        for ( let i in userNames ) {
            let htmlElement: any = userNames[i];
            if ( htmlElement ) {
                usersFound.push(htmlElement.innerText)
            } else {
                usersFound.push("")
            }
        }
        
        const liMessages = document.querySelectorAll("li[class^=msg-conversation-listitem]")
        let collectId: any[] = [];
        for ( let i in liMessages ) {
            if ( liMessages[i].id ) collectId.push(liMessages[i].id);
        }


        
        return new Promise( (resolve, reject) => {
            resolve({"collectIds": collectId, "userNames": usersFound, "userTitles": usersTitleFound})
        })
     });



     const timer = (ms:any) => new Promise(res => setTimeout(res, ms))
     async function load (liMessage: any[], usersNames: any[], userTitles: any[], options: IOptions) : Promise<any> {
        
        let limitMsgToParse = options.parseMessagesLimit !== null ? options.parseMessagesLimit : liMessage.length;

        console.log("Parse with options: ")
        console.log(options)

        let completed:any[] = [];
        for ( let i = 0; i < limitMsgToParse; i++ ){
                
            // Map user with the corresponding tab message
            await page.click(`li#${liMessage[i]}`);
            console.log(`Looking for ${usersNames[i]} - ${userTitles[0]} messages ... `)

            await timer(2000)
            let messagesContents = await page.$$eval('.msg-s-message-list__event', (msgsContents:any) => msgsContents.map( (el:HTMLElement) => el.innerText))
            

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

        return new Promise( resolve => {
            resolve(completed);
        })
     }

     console.log("== TAB LOG ==")
     const {collectIds, userNames, userTitles} = tabMsgIds; 

    
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
    
    const dataMessagesList: Array<LinkedinMessages> = completedTask.map( (msg:any) => <LinkedinMessages>{content: msg.messagesSend, username: msg.userName, jobTitle: msg.userTitle, createdAt: new Date().toISOString(),updatedAt: null,parsedByUserEmail:credentials.login})

    //let response = completedTask.map( msg => new LinkedinMessage())

    return new Promise( (resolve, reject) => {
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