import { JsonProperty, Serializable } from 'typescript-json-serializer';

import { toPairs } from 'lodash';

import { Field } from './field';

@Serializable()
export class BiQuery {
    @JsonProperty()
    public datasource: string;
    @JsonProperty()
    public limit: number;
    @JsonProperty()
    public sample: number;
    @JsonProperty({type: Field})
    public fields: Field[];
    public filter: {};
    public having: {};

    // static fromJSON(json: any): BiQuery {
    //     function extract(name) {
    //         // if (json.hasOwnProperty(name)) {
    //         //     json[name] = DeserializationHelper.map<String, String>(
    //         //         toPairs(json[name]).map(item => [TypedJSON.stringify(item[0]), TypedJSON.stringify(item[1])]),
    //         //         String, String
    //         //     );
    //         //     delete json[name];
    //         // }
    //     }
    //     extract('filter');
    //     extract('having');
    //     if (json.hasOwnProperty('fields')) {
    //         json.fields = DeserializationHelper.array<Field>(json.fields, Field);
    //     }
    //
    //     return Object.assign(Object.create(BiQuery.prototype), json);
    // }

    // toJSON() {
    //     return Object.assign({}, this, {
    //         filter: SerializationHelper.map<String, String>(this.where),
    //         fields: SerializationHelper.array<Field>(this.fields)
    //     });
    // }
}
