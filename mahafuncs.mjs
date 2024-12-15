
import util from 'node:util';
import { promises as fsp } from "node:fs";
import YAML from 'js-yaml';
import akasha from 'akasharender';
const mahabhuta = akasha.mahabhuta;


const pluginName = 'OpenADR-Specification';

export function mahabhutaArray(options) {
    let ret = new mahabhuta.MahafuncArray(pluginName, options);
    ret.addMahafunc(new SchemaDescriptions());
    ret.addMahafunc(new OpenAPISecurityScopes());
    ret.addMahafunc(new OpenAPIEndpoints());
    return ret;
};

export class SchemaDescriptions extends mahabhuta.CustomElement {
    get elementName() { return "schema-descriptions"; }
    async process($element, metadata, dirty) {
        // Read schema YAML file
        // Step through `definitions` - finding keys - definitions[key].description

        const schemaFN = $element.attr('schemahref');
        const template = $element.attr('template')
                ? $element.attr('template')
                : 'schema-descriptions.html.njk';
        const id = $element.attr('id');

        if (!schemaFN || typeof schemaFN !== 'string') {
            throw new Error(`No schema file given ${util.inspect(schemaFN)}`);
        }
        if (!template || typeof template !== 'string') {
            throw new Error(`No template given ${util.inspect(template)}`);
        }

        const schemayml = await fsp.readFile(schemaFN, 'utf-8');
        const schema = YAML.load(schemayml);

        if (!schema.$id || typeof schema.$id !== 'string') {
            throw new Error(`Valid schema ${schemaFN}?  No $id`);
        }
        if (!schema.title || typeof schema.title !== 'string') {
            throw new Error(`Valid schema ${schemaFN}?  No title`);
        }
        if (!schema.definitions || typeof schema.definitions !== 'object') {
            throw new Error(`Valid schema ${schemaFN}?  No definitions`);
        }

        const defs = [];
        for (const defkey in schema.definitions) {
            defs.push({
                key: defkey,
                description: schema.definitions[defkey].description
            });
        }

        return akasha.partial(
            this.array.options.config,
            template, {
                defs, id
            });
    }
}

class OpenAPISecurityScopes extends mahabhuta.CustomElement {
    get elementName() { return "openapi-security-scopes"; }
    async process($element, metadata, dirty) {

        const template = $element.attr('template')
                ? $element.attr('template')
                : 'openapi-security-scopes.html.njk';
        const id = $element.attr('id');

        const spec = this.array.options.specs.OADR;
        const security = spec.components.securitySchemes;
        const scopes = security.oAuth2ClientCredentials.flows.clientCredentials.scopes;

        // console.log(`OpenAPISecurityScopes security `, security);
        // console.log(`OpenAPISecurityScopes scopes `, scopes);
        
        const defs = [];
        for (const defkey in scopes) {
            defs.push({
                key: defkey,
                description: scopes[defkey]
            });
        }

        // console.log(`OpenAPISecurityScopes defs `, defs);

        return akasha.partial(
            this.array.options.config,
            template, {
                defs, id
            });
    }
}

class OpenAPIEndpoints extends mahabhuta.CustomElement {
    get elementName() { return "openapi-endpoints"; }
    async process($element, metadata, dirty) {

        const template = $element.attr('template')
                ? $element.attr('template')
                : 'openapi-endpoints-table.html.njk';
        const id = $element.attr('id');

        const spec = this.array.options.specs.OADR;
        const paths = spec.paths;

        const endpoints = [];
        for (const path in paths) {
            for (const method in paths[path]) {
                // Skip this - it's not a method
                if (method === 'parameters') continue;

                const ep = `${method.toUpperCase()} ${path}`;
                let topush = {
                    ep
                };
                topush.path = path;
                topush.method = method;
                topush.description = paths[path][method].description;
                if (paths[path][method].security) {
                    for (const security of paths[path][method].security) {
                        if ('oAuth2ClientCredentials' in security
                            && Array.isArray(security['oAuth2ClientCredentials'])
                            && security.oAuth2ClientCredentials.length >= 1
                        ) {
                            topush.security = security.oAuth2ClientCredentials.join(' ');
                        }
                    }
                }
                if (method === 'get') {
                    if (paths[path][method].parameters) {
                        let params = [];
                        for (const param of paths[path][method].parameters) {
                            params.push(param.name);
                        }
                        topush.queryParameters = params.join(' ');
                    }
                } else if (method === 'post') {
                    if (paths[path][method].requestBody) {
                        const content = paths[path][method].requestBody.content;
                        if ('application/json' in content) {
                            topush.requestBody = content['application/json'].schema.$ref;
                        } else if ('application/x-www-form-urlencoded' in content) {
                            topush.requestBody = content['application/x-www-form-urlencoded'].schema.$ref;
                        }
                        // console.log(paths[path][method].requestBody.content);
                        // topush.requestBody = paths[path][method].requestBody
                        //         .content['application/json']?.schema?.$ref;
                    }
                } else if (method === 'put') {
                    if (paths[path][method].requestBody) {
                        const content = paths[path][method].requestBody.content;
                        if ('application/json' in content) {
                            topush.requestBody = content['application/json'].schema.$ref;
                        } else if ('application/x-www-form-urlencoded' in content) {
                            topush.requestBody = content['application/x-www-form-urlencoded'].schema.$ref;
                        }
                        // console.log(paths[path][method].requestBody.content);
                        // topush.requestBody = paths[path][method].requestBody
                        //         .content['application/json']?.schema?.$ref;
                    }
                } else if (method === 'delete') {

                }
                endpoints.push(topush);
            }
        }

        // console.log(endpoints);

        return akasha.partial(
            this.array.options.config,
            template, {
                endpoints, id
            });
    }
}

// style='page-break-before: always'
// .page_break { page-break-before: always; }
// div.page_break + div.page_break{
//    page-break-before: always;
// }
// <div class="page_break"></div>


// class HnNumbering extends mahabhuta.PageProcessor {
// 	async process($, metadata, dirty) /* : Promise<string> */ {

//         const headers = $("section > h1,h2,h3,h4,h5").get()
//         .map(element => {
//             return {
//                 path: metadata.document.path,
//                 id: $(element).attr('id'),
//                 name: element.tagName,
//                 text: $(element).text()
//             };
//         });

//         console.log(headers);
        
// 	}
// }

