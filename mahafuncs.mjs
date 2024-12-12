
import util from 'node:util';
import { promises as fsp } from "node:fs";
import YAML from 'js-yaml';
import akasha from 'akasharender';
const mahabhuta = akasha.mahabhuta;


const pluginName = 'OpenADR-Specification';

export function mahabhutaArray(options) {
    let ret = new mahabhuta.MahafuncArray(pluginName, options);
    ret.addMahafunc(new SchemaDescriptions());
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

// style='page-break-before: always'
// .page_break { page-break-before: always; }
// div.page_break + div.page_break{
//    page-break-before: always;
// }
// <div class="page_break"></div>
