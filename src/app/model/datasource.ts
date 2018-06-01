import { JsonMember, JsonObject, TypedJSON } from '@upe/typedjson';

import { findIndex } from 'lodash';

import { Field } from './field';

@JsonObject()
export class Datasource {
    @JsonMember()
    public name: string;
    @JsonMember()
    public description: string;
    @JsonMember({elements: Field, name: 'fields'})
    public fields: Field[];
    @JsonMember()
    public sample: boolean;
    public tableFields: Field[];

    static fromJSON(json: any): Datasource {
        return TypedJSON.parse(json, Datasource);
    }

    getFieldByName(name: string) {
        const index = findIndex(this.fields, f => f.name === name);

        return this.fields[index];
    }
}
