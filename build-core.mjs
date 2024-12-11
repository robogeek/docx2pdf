
import { default as config } from './config.mjs';
import puppeteer from 'puppeteer-core';
import chromium from "@sparticuz/chromium";

// Optional: If you'd like to use the new headless mode. "shell" is the default.
chromium.setHeadlessMode = true;
// Optional: If you'd like to disable webgl, true is the default.
chromium.setGraphicsMode = false;

const akasha = config.akasha;
await akasha.setup(config);

// await data.removeAll();
await config.copyAssets();
let results = await akasha.render(config);


const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
});

const page = await browser.newPage();
const loaded = page.waitForNavigation({
    waitUntil: 'load'
});

const content = fs.readFileSync('out/Definition.html', 'utf-8');
await page.setContent(content);
await loaded;

const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div class="title">TITLE GOES HERE</div>',
    footerTemplate: '<div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
});
fs.writeFileSync('testFs.pdf', pdfBuffer);

await browser.close();
await akasha.closeCaches();
