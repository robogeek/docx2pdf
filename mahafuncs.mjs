
import util from 'node:util';
import { promises as fsp } from "node:fs";
import YAML from 'js-yaml';
import akasha from 'akasharender';
const mahabhuta = akasha.mahabhuta;


// Pre-load the specifications for easy reuse
const OADRspec = await fsp.readFile(
    `/home/david/Projects/openadr/docx2pdf/../specification/3.1.0/openadr3.yaml`,
    'utf-8'
);
const OADRYAML = YAML.load(OADRspec);

const specs = {
    OADR: OADRYAML
};

const pluginName = 'OpenADR-Specification';

export function mahabhutaArray(options) {
    let ret = new mahabhuta.MahafuncArray(pluginName, options);
    ret.addMahafunc(new SchemaDescriptions());
    ret.addMahafunc(new OpenAPISecurityScopes());
    ret.addMahafunc(new OpenAPIEndpoints());
    ret.addMahafunc(new OpenAPIInformationModel());
    ret.addMahafunc(new HnNumbering());
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
        const caption = $element.attr('caption');
        const keyHeader = $element.attr('keyheader');
        const descHeader = $element.attr('descriptionheader');

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
                defs, id, caption, keyHeader, descHeader
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

        const spec = specs.OADR;
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

        const spec = specs.OADR;
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


class OpenAPIInformationModel extends mahabhuta.CustomElement {
    get elementName() { return "openapi-information-model"; }
    async process($element, metadata, dirty) {

        const template = $element.attr('template')
                ? $element.attr('template')
                : 'openapi-information-model.html.njk';
        const id = $element.attr('id');

        const spec = specs.OADR;

        // This loop controls which of the OpenADR schema objects
        // are presented in the document, and also controls the order.
        //
        // To simply show every item, and not control the order,
        // the loop control is:
        //
        //     for (const schemakey in specs.OADR.components.schemas) {
        //     }
        const schemas = [];
        for (const schemakey of [
            'program', 'report', 'event', 'subscription',
            'ven', 'resource', 'interval', 'intervalPeriod',
            'valuesMap', 'point',
            'eventPayloadDescriptor',
            'reportPayloadDescriptor',
            'reportDescriptor',
            'objectID', 'notification', 'objectTypes',
            'dateTime', 'duration', 'problem', 'bindings',
            'binding', 'certs', 'topicNames', 'topics'
        ]) {
            if (!(schemakey in specs.OADR.components.schemas)) {
                continue;
            }
            const schema = specs.OADR.components.schemas[schemakey];
            const topush = {
                schema: schemakey,
                description: schema.description,
                properties: []
            };
            for (const propkey in schema.properties) {
                const prop = schema.properties[propkey];
                if ('description' in prop) {
                    topush.properties.push({
                        prop: propkey,
                        description: prop.description
                    });
                } else if ('$ref' in prop) {
                    topush.properties.push({
                        prop: propkey,
                        $ref: prop.$ref
                    });
                } else {
                    topush.properties.push({
                        prop: propkey,
                        unknown: `No description found in ${util.inspect(prop)}`
                    });
                }
            }
            schemas.push(topush);
        }
        // console.log(YAML.dump({ schemas }, { indent: 4 }));

        return akasha.partial(
            this.array.options.config,
            template, {
                schemas, id
            });
    }
}

// style='page-break-before: always'
// .page_break { page-break-before: always; }
// div.page_break + div.page_break{
//    page-break-before: always;
// }
// <div class="page_break"></div>

/**
 * Generate numbering for Hn tags, along with generating
 * a table of contents.
 * 
 * The technique for numbering Hn tags is similar to
 * the CSS in this Gist: https://gist.github.com/rodolfoap/6cd714a65a891c6fe699ab91f0d22384
 * In that case, a CSS counter is kept for H1/H2/H3/etc tags,
 * which is reset at certain cases.
 * 
 * What we're doing is looking for H1, H2, H3 tags.
 * The corresponding counter is kept tracking the numbering
 * for each.  For H2 and H3 tags the counter will be reset
 * to zero when needed.
 * 
 * The text of the Hn tag is the original text prepended
 * with the counters.
 * 
 * Next, the headers array stores data about the Hn tags.
 * It stores the level of each Hn tag as a child of the
 * previous Hn parent.  This way the ToC becomes a nested
 * list of items.
 * 
 * Next, a Partial traverses that list producing
 * a <nav><ul>...</ul></nav> structure
 * The <nav> tag is important because it is the
 * semantically correct HTML element.
 * 
 * Finally, the text generated with the Partial
 * replaces the <toc-text-here> tag.
 */
class HnNumbering extends mahabhuta.PageProcessor {
	async process($, metadata, dirty) /* : Promise<string> */ {

        let counter_h1 = 0;
        let counter_h2 = 0;
        let counter_h3 = 0;

        const headers = [];
        let prevH1;
        let prevH2;
        let prevH3;
        $('article').find('h1:not(.header-title), h2, h3').each(function() {
            if ($(this).is('h1')) {
                counter_h1++;
                counter_h2 = counter_h3 = 0;

                const title = `${counter_h1}. ${$(this).text()}`;
                $(this).text(title);
            }
            if ($(this).is('h2')) {
                counter_h2++;
                counter_h3 = 0;

                const title = `${counter_h1}.${counter_h2}. ${$(this).text()}`;
                $(this).text(title);
            }
            if ($(this).is('h3')) {
                counter_h3++;

                const title = `${counter_h1}.${counter_h2}.${counter_h3}. ${$(this).text()}`;
                $(this).text(title);
            }
            if ($(this).is('h1')) {
                prevH1 = {
                    id: $(this).parent('section').attr('id'),
                    title: $(this).text()
                };
                headers.push(prevH1);
                prevH2 = prevH3 = undefined;
            } else if ($(this).is('h2')) {
                if (!prevH1) {
                    throw new Error(`H2 found before any H1`);
                }
                if (!('children' in prevH1)) {
                    prevH1.children = [];
                }
                prevH2 = {
                    id: $(this).parent('section').attr('id'),
                    title: $(this).text()
                };
                prevH1.children.push(prevH2);
            } else if ($(this).is('h3')) {
                if (!prevH2) {
                    throw new Error(`H2 found before any H1`);
                }
                if (!('children' in prevH2)) {
                    prevH2.children = [];
                }
                prevH3 = {
                    id: $(this).parent('section').attr('id'),
                    title: $(this).text()
                };
                prevH2.children.push(prevH3);
            }
        });

        // console.log(headers);
        
        const toctext = await akasha.partial(
            this.array.options.config,
            'toc.html.njk', {
            headers
        });

        // console.log(toctext);

        $('toc-text-here').replaceWith(toctext);
	}
}

