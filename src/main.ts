'use strict';

const puppeteer = require('puppeteer');

const libsIcon = require('./libs/iconDownloader');


(async() => {
    
    // TODO test
    //libsIcon.downloadIcon("https://www.wowhead.com/spell=26656/black-qiraji-battle-tank", "./")
    
    for ( let i = 0; i < 20 ; i++ )  {
    //const browser = await puppeteer.launch({ headless: false }); // default is true
    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });

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


    dataIcons.map( (iconUrlCss: string) => {
        let cleanUrl = iconUrlCss.replace('url("', "").replace('")',"");
        libsIcon.downloadIcon(cleanUrl, "/tmp/icons")

    })


    }


    //await browser.close();
})();