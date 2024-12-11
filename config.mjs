
import akasha from 'akasharender';
const mahabhuta = akasha.mahabhuta;
import path from 'node:path';
import util from 'node:util';
import { promises as fsp } from 'node:fs';

import YAML from 'js-yaml';

import { default as MarkdownITPlantUML } from 'markdown-it-plantuml';
import { default as MarkdownITHighlightJS } from 'markdown-it-highlightjs';
import { default as MarkdownItAttrs } from 'markdown-it-attrs';
import { default as MarkdownItContainer } from 'markdown-it-container';

import { ThemeBootstrapPlugin } from '@akashacms/theme-bootstrap';
import { BasePlugin } from '@akashacms/plugins-base';
import { FootnotesPlugin } from '@akashacms/plugins-footnotes';
import { ExternalLinksPlugin } from '@akashacms/plugins-external-links';

import { default as EPUBWebsitePlugin } from 'epub-website';

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
    .use(MarkdownItContainer);
    // .use(require('markdown-it-expand-tabs'), { tabWidth: 4 });

config
    // .addAssetsDir('assets')
    .addLayoutsDir('layouts')
    .addDocumentsDir('documents')
    .addPartialsDir('partials')
    ;

config
    .use(ThemeBootstrapPlugin)
    .use(BasePlugin, {
        generateSitemapFlag: false
    })
    .use(ExternalLinksPlugin)
    .use(FootnotesPlugin)
    .use(EPUBWebsitePlugin)
    ;

config
    .addFooterJavaScript({ href: "/vendor/jquery/jquery.min.js" })
    .addFooterJavaScript({ href: "/vendor/popper.js/umd/popper.min.js" })
    .addFooterJavaScript({ href: "/vendor/bootstrap/js/bootstrap.min.js" })
    .addStylesheet({ href: "/vendor/bootstrap/css/bootstrap.min.css" })
    .addStylesheet({       href: "/style.css" });

config.setMahabhutaConfig({
    recognizeSelfClosing: true,
    recognizeCDATA: true,
    decodeEntities: true
});

import { mahabhutaArray } from './mahafuncs.mjs';

// Pull in the Mahafuncs for this project
// Make sure to pass the config object in the
// options object.
config.addMahabhuta(mahabhutaArray({ config }));



config.prepare();
export default config;

