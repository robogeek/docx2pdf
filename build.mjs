
import { default as config } from './config.mjs';
import puppeteer from 'puppeteer';

const akasha = config.akasha;
await akasha.setup(config);

// await data.removeAll();
await config.copyAssets();
let results = await akasha.render(config);

// Initialization comes from 
// https://apitemplate.io/blog/tips-for-generating-pdfs-with-puppeteer/
const browser = await puppeteer.launch({
    headless: true,
    userDataDir: './tmp',
    args: [   '--disable-features=IsolateOrigins',
              '--disable-site-isolation-trials',
              '--autoplay-policy=user-gesture-required',
              '--disable-background-networking',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-breakpad',
              '--disable-client-side-phishing-detection',
              '--disable-component-update',
              '--disable-default-apps',
              '--disable-dev-shm-usage',
              '--disable-domain-reliability',
              '--disable-extensions',
              '--disable-features=AudioServiceOutOfProcess',
              '--disable-hang-monitor',
              '--disable-ipc-flooding-protection',
              '--disable-notifications',
              '--disable-offer-store-unmasked-wallet-cards',
              '--disable-popup-blocking',
              '--disable-print-preview',
              '--disable-prompt-on-repost',
              '--disable-renderer-backgrounding',
              '--disable-setuid-sandbox',
              '--disable-speech-api',
              '--disable-sync',
              '--hide-scrollbars',
              '--ignore-gpu-blacklist',
              '--metrics-recording-only',
              '--mute-audio',
              '--no-default-browser-check',
              '--no-first-run',
              '--no-pings',
              '--no-sandbox',
              '--no-zygote',
              '--password-store=basic',
              '--use-gl=swiftshader',
              '--use-mock-keychain']
});

const page = await browser.newPage();
await page.goto(`file://${__dirname}/out/Definition.html`, { waitUntil: 'networkidle0' });

// Generate PDF at default resolution
const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: `
        <div class="text-center title" style="margin-left: auto; margin-right: auto; font-size: 12px;">TITLE GOES HERE</div>
    `,
    // headerTemplate: `
    //     <div class="text-center title" style="margin: 0 15mm 5mm; font-size: 12px;">TITLE GOES HERE</div>
    // `,
    footerTemplate: `
        <div class="text-left"  style="margin: 0 auto 0 20mm; text-align: left; font-size: 12px;">Copyright © OpenADR Alliance (2023-24). All Rights Reserved</div>
        <div class="text-right" style="margin: 0 20mm 0 auto; text-align: right; font-size: 12px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
    `,
    printBackground: true
});

// Write PDF to file
fs.writeFileSync('PDF/Definition.pdf', pdf);


const page2 = await browser.newPage();
await page2.goto(`file://${__dirname}/out/User_Guide.html`, { waitUntil: 'networkidle0' });

// Generate PDF at default resolution
const pdf2 = await page2.pdf({
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: `
        <div class="text-center title" style="margin-left: auto; margin-right: auto; font-size: 12px;">TITLE GOES HERE</div>
    `,
    // headerTemplate: `
    //     <div class="text-center title" style="margin: 0 15mm 5mm; font-size: 12px;">TITLE GOES HERE</div>
    // `,
    footerTemplate: `
        <div class="text-left"  style="margin: 0 auto 0 20mm; text-align: left; font-size: 12px;">Copyright © OpenADR Alliance (2023-24). All Rights Reserved</div>
        <div class="text-right" style="margin: 0 20mm 0 auto; text-align: right; font-size: 12px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
    `,
});

// Write PDF to file
fs.writeFileSync('PDF/User_Guide.pdf', pdf2);


const page3 = await browser.newPage();
await page3.goto(`file://${__dirname}/out/Markdown-Formatting-Guide.html`, { waitUntil: 'networkidle0' });

// Generate PDF at default resolution
const pdf3 = await page3.pdf({
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: `
        <div class="text-center title" style="margin-left: auto; margin-right: auto; font-size: 12px;">TITLE GOES HERE</div>
    `,
    // headerTemplate: `
    //     <div class="text-center title" style="margin: 0 15mm 5mm; font-size: 12px;">TITLE GOES HERE</div>
    // `,
    footerTemplate: `
        <div class="text-left"  style="margin: 0 auto 0 20mm; text-align: left; font-size: 12px;">Copyright © OpenADR Alliance (2023-24). All Rights Reserved</div>
        <div class="text-right" style="margin: 0 20mm 0 auto; text-align: right; font-size: 12px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
    `,
});

// Write PDF to file
fs.writeFileSync('PDF/Markdown-Formatting-Guide.pdf', pdf3);


await browser.close();
await akasha.closeCaches();
