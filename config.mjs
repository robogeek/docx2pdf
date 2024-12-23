
import akasha from 'akasharender';
const mahabhuta = akasha.mahabhuta;
import path from 'node:path';
import util from 'node:util';
import { promises as fsp } from 'node:fs';

import YAML from 'js-yaml';

import { default as MarkdownITPlantUML } from 'markdown-it-plantuml';
import { default as MarkdownITHighlightJS } from 'markdown-it-highlightjs';
import { default as MarkdownItAttrs } from 'markdown-it-attrs';
import { default as MarkdownItDiv } from 'markdown-it-div';
import { default as MarkdownItAnchor } from 'markdown-it-anchor';
import { default as MarkdownItFootnote } from 'markdown-it-footnote';
// import { default as MarkdownItTOC } from 'markdown-it-table-of-contents';
import { default as MarkdownItSections } from 'markdown-it-header-sections';
import { default as MarkdownItImageFigures } from 'markdown-it-image-figures';
import { default as MarkdownItMultiMDTable } from 'markdown-it-multimd-table';
import { default as MarkdownItTableCaptions } from 'markdown-it-table-captions';

import { ThemeBootstrapPlugin } from '@akashacms/theme-bootstrap';
import { BasePlugin } from '@akashacms/plugins-base';
// import { FootnotesPlugin } from '@akashacms/plugins-footnotes';
// import { ExternalLinksPlugin } from '@akashacms/plugins-external-links';

// import { default as EPUBWebsitePlugin } from 'epub-website';

const config = new akasha.Configuration();

config.rootURL("https://example.akashacms.com");

const __dirname = import.meta.dirname;
config.configDir = __dirname;

config.findRendererName('.html.md')
    .configuration({
        html:         true,
        xhtmlOut:     false,
        breaks:       false,
        linkify:      true,
        typographer:  false,
    })
    .use(MarkdownITPlantUML, {
        imageFormat: 'svg'
    })
    .use(MarkdownITHighlightJS, { 
        auto: true, 
        code: true 
    })
    .use(MarkdownItAttrs, {
        allowedAttributes: [ 'id', 'class' ]
    })
    .use(MarkdownItDiv)
    .use(MarkdownItAnchor)
    // .use(MarkdownItTOC)
    .use(MarkdownItFootnote)
    .use(MarkdownItSections)
    .use(MarkdownItImageFigures, {
        dataType: true,
        figcaption: true,
        tabindex: true
    })
    .use(MarkdownItMultiMDTable, {
        multiline:  true,
        rowspan:    true,
        headerless: true,
        multibody:  true,
        aotolabel:  true,
    })
    .use(MarkdownItTableCaptions);
    // .use(require('markdown-it-expand-tabs'), { tabWidth: 4 });

config.findRendererName('.html.md')
    .rendererRules.footnote_block_open = () => (
        '<h1 class="mt-3">Footnotes</h1>\n' +
        '<section class="footnotes">\n' +
        '<ol class="footnotes-list">\n'
    );

config
    // .addAssetsDir('assets')
    .addAssetsDir({
        src: 'node_modules/bootstrap/dist',
        dest: 'vendor/bootstrap'
    })
   .addAssetsDir({
        src: 'node_modules/jquery/dist',
        dest: 'vendor/jquery'
    })
    .addAssetsDir({
        src: 'node_modules/popper.js/dist',
        dest: 'vendor/popper.js'
    })
    .addLayoutsDir('layouts')
    .addDocumentsDir('documents')
    .addPartialsDir('partials')
    ;

config
    .use(ThemeBootstrapPlugin)
    .use(BasePlugin, {
        generateSitemapFlag: false
    })
    // .use(ExternalLinksPlugin)
    // .use(FootnotesPlugin)
    // .use(EPUBWebsitePlugin)
    ;

config
    .addFooterJavaScript({ href: "/vendor/jquery/jquery.min.js" })
    .addFooterJavaScript({ href: "/vendor/popper.js/umd/popper.min.js" })
    .addFooterJavaScript({ href: "/vendor/bootstrap/js/bootstrap.min.js" })
    .addStylesheet({ href: "/vendor/bootstrap/css/bootstrap.min.css" })
    .addStylesheet({       href: "/style.css" })
    .addStylesheet({       href: "/print.css" });

config.setMahabhutaConfig({
    recognizeSelfClosing: true,
    recognizeCDATA: true,
    decodeEntities: true
});

import { mahabhutaArray } from './mahafuncs.mjs';

// Pre-load the specifications for easy reuse
const OADRspec = await fsp.readFile(
    `/home/david/Projects/openadr/docx2pdf/../specification/3.1.0/openadr3.yaml`,
    'utf-8'
);
const OADRYAML = YAML.load(OADRspec);

// Pull in the Mahafuncs for this project
// Make sure to pass the config object in the
// options object.
config.addMahabhuta(mahabhutaArray({ 
    config,
    specs: {
        OADR: OADRYAML
    }
}));



config.prepare();
export default config;

