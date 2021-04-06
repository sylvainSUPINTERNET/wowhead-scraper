'use strict';

const path = require('path');

const puppeteer = require('puppeteer');

const libsIcon = require('./libs/iconDownloader');



(async () => {
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
    await page.waitForTimeout(4)

    await page.$eval('#username', (el: any) => el.value = "");
    await page.$eval('#password', (el: any) => el.value = "");
    await page.click('button[type="submit"]'); // With type

    let chatIcon = await page.evaluate( () => {
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
    

    console.log("END")
    await browser.close();

})();



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