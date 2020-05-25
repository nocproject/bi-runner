import { JsonProperty, Serializable } from 'typescript-json-serializer';

import { findIndex } from 'lodash';

import { Field } from './field';

@Serializable()
export class Datasource {
    @JsonProperty()
    public name: string;
    @JsonProperty()
    public description: string;
    @JsonProperty({type: Field})
    public fields: Field[];
    @JsonProperty()
    public sample: boolean;
    public tableFields: Field[];
    public origFields: Field[];

    // static fromJSON(json: any): Datasource {
    //     // return TypedJSON.parse(json, Datasource);
    //     return new Datasource();
    // }

    getFieldByName(name: string) {
        const index = findIndex(this.fields, f => f.name === name);

        return this.fields[index];
    }
}
