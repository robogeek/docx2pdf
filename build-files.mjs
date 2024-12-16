
const __dirname = import.meta.dirname;

import { promises as fsp, constants } from 'node:fs';
import path from 'node:path';

import packageConfig from './package.json' with { type: 'json' }; 

// import { default as config } from './config.mjs';
import puppeteer from 'puppeteer';
import { Command } from 'commander';
import { util } from 'chai';
const program = new Command();

program
    // .name('build-documents')
    .description('CLI to build PDF files from Markdown/AkashaCMS documents')
    .version(packageConfig.version,
        '-v, --version', 'output the current version')
    .argument('<configFN>', 'AkashaCMS configuration file')
    .argument('<docPaths...>', 'VPaths for documents to render')
    .option('--no-headless', 'Turn off headless mode')
    // .option('--no-exit', 'Do not exit when rendering finished')
    .option('--no-pdf', 'Do not generate PDFs')
    .option('--format <format>', 'Page format, "A3", "A4", "A5", "Legal", "Letter" or "Tabloid"')
    // .option('--paper-orientation [orientation]', '"portrait" or "landscape"')
    .option('--pdf-output <pdfDir>', 'Output directory for PDF generation')
    .option('--template-header <tmplHeader', 'HTML template for page header')
    .option('--template-footer <tmplFooter', 'HTML template for page footer')
    .action(async (configFN, docPaths, options, command) => {

        // console.log({
        //     configFN,
        //     docPaths,
        //     options
        // });
        
        if (!isPaperFormat(options.format)) {
            throw new Error(`Paper format ${util.inspect(options.format)} incorrect`);
        }
        // if (options.paperOrientation !== 'landscape'
        //  && options.paperOrientation !== 'portrait'
        // ) {
        //     throw new Error(`Incorrect paper orientation ${util.inspect(options.paperOrientation)}`);
        // }

        await PDFOutputDir(options.pdfOutput);

        if (!fsp.access(
                options.templateHeader,
                constants.R_OK
        )) {
            throw new Error(`Header template doesn't exist or is not readable - ${options.templateHeader}`);
        }
        if (!fsp.access(
            options.templateFooter,
            constants.R_OK
        )) {
            throw new Error(`Footer template doesn't exist or is not readable - ${options.templateFooter}`);
        }

        const config = (await import(
            path.join(process.cwd(), configFN)
        )).default;

        const renderedPaths = await renderDocuments(
            config, docPaths
        );
        // console.log(renderedPaths);

        const browser = await launchBrowser(
             options.headless
        );
        if (options.pdf) {
            for (const renderedPath of renderedPaths) {
                await renderDocToPDF(
                    browser,
                    config,
                    renderedPath,
                    options.pdfOutput,
                    options.format,
                    options.templateHeader,
                    options.templateFooter,
                    // options.paperOrientation
                );
            }
        }
        await browser.close();
    });



program.parse();

// Paper formats from https://pptr.dev/api/puppeteer.paperformat
// Letter: 8.5in x 11in
// Legal: 8.5in x 14in
// Tabloid: 11in x 17in
// Ledger: 17in x 11in
// A0: 33.1102in x 46.811in
// A1: 23.3858in x 33.1102in
// A2: 16.5354in x 23.3858in
// A3: 11.6929in x 16.5354in
// A4: 8.2677in x 11.6929in
// A5: 5.8268in x 8.2677in
// A6: 4.1339in x 5.8268in

function isPaperFormat(format) {
    return typeof format === 'string'
     && ( 
        format === 'Letter'
        || format === 'Legal'
        || format === 'Ledger'
        || format === 'A0'
        || format === 'A1'
        || format === 'A2'
        || format === 'A3'
        || format === 'A4'
        || format === 'A5'
        || format === 'A6'
     );
}

async function PDFOutputDir(pdfDir) {
    if (!typeof pdfDir === 'string') {
        throw new Error(`Unknown PDF output directory ${util.inspect(pdfDir)}`);
    }
    // console.log(`${__dirname} ${pdfDir}`);
    const dirnm = path.join(__dirname, pdfDir);
    // console.log(dirnm);
    await fsp.mkdir(dirnm, {
            recursive: true
        }
    );
}

async function renderDocuments(config, docPaths) {

    let akasha = config.akasha;
    await akasha.setup(config);
    const documents = akasha.filecache.documentsCache;
    await config.copyAssets();

    const renderedPaths = [];
    for (const docPath of docPaths) {
        const doc = await documents.find(docPath);
        let result = await akasha.renderPath(
            config, docPath
        );
        // console.log(result);
        renderedPaths.push(doc.renderPath);
    }

    await akasha.closeCaches();

    return renderedPaths;
}

async function launchBrowser(
    headless
) {
    // Initialization comes from 
    // https://apitemplate.io/blog/tips-for-generating-pdfs-with-puppeteer/
    const browser = await puppeteer.launch({
        headless,
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

    return browser;
}

async function renderDocToPDF(
    browser,
    config,
    renderedPath,
    PDFdir,
    format,
    tmplHeader,
    tmplFooter,
    // paperOrientation
) {
    let landscape = false;
    // This did not make any difference,
    // so let's leave it out.
    //
    // if (paperOrientation === 'landscape') {
    //     landscape = true;
    // }
    const page = await browser.newPage();
    const outFN = path.join(
        __dirname,
        config.renderDestination,
        renderedPath
    );
    await page.goto(
        `file://${outFN}`, {
            waitUntil: 'networkidle0'
        });

    // Generate PDF at default resolution
    const opts = {
        format,
        landscape,
        margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
        },
        displayHeaderFooter: true,
        headerTemplate: tmplHeader,
        footerTemplate: tmplFooter,
        printBackground: true
    };
    // console.log(opts);
    const pdf = await page.pdf(opts);

    // Write PDF to file
    const pdfFN = path.basename(renderedPath, path.extname(renderedPath))+'.pdf';
    // console.log(pdfFN);
    await fsp.writeFile(
        path.join(PDFdir, pdfFN), pdf);

}
