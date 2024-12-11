
Demonstration of using AkashaCMS tools & Puppeteer to convert Markdown documents to PDF.

An AkashaCMS project is a Node.js project directory where the `package.json` describes all the project dependencies, and the `config.mjs` file describes the project configuration.  The purpose is to take some content files, various templates, and produce output like a website, an EPUB, and in this case PDF files.

https://akashacms.com - project website

* [config.mjs](./config.mjs) -- Project configuration
* [layouts](./layouts/) -- Directory for page layout templates
* [partials](./partials/) -- Directory for project-specific "partial" templates
* [documents](./documents/) -- Documents to render into the website, etc
* [mahafuncs.mjs](./mahafuncs.mjs) -- Project-specific functions
* [build.mjs](./build.mjs) -- Build script that uses Puppeteer
* [build-core.mjs](./build-core.mjs) -- Build script that uses Puppeteer-Core
* [PDF](./PDF/) -- Directory containing built PDF files

# Setup

Make sure that Node.js 20.x or 22.x or later is installed.  I'm using 22.x.  This may work on 20.x.

```shell
$ npm install
```

# Render everything

```shell
$ time npx zx build.mjs 

real	0m8.323s
user	0m6.869s
sys	0m1.309s
```

As currently configured this will briefly pop up a browser window showing the browser version of the rendered document.  The script can be configured to not exit, allowing you to inspect this version.

Intermediate HTML files will appear in the `out` directory.

The PDF directory will be updated with the files.


