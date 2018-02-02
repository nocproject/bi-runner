import { JsonMember, JsonObject, TypedJSON } from '@upe/typedjson';
import { toPairs } from 'lodash';

import { Field } from './field';
import { DeserializationHelper } from './helpers';

// ToDo need recursion for where
// doesn't work:
//      type Clause = Map<String, Clause>;
//
// doesn't work:
//      @JsonMember({type: Clause})
//      public filter: Clause;
//
//      export class Clause {
//          @JsonMember
//          public clause: Map<String, Clause[]>;
//      }

@JsonObject({initializer: Parameter.fromJSON})
export class Parameter {
    @JsonMember()
    public datasource: string;
    @JsonMember()
    public limit: number;
    @JsonMember()
    public sample: number;
    @JsonMember({elements: Field})
    public fields: Field[];
    // @JsonMapMember({elements: [String, String], name: 'filter'})
    // public where: Map<String, String>;
    public filter: {};

    static fromJSON(json: any): Parameter {
        if (json.hasOwnProperty('filter')) {
            json.filter = DeserializationHelper.map<String, String>(
                toPairs(json.filter).map(item => [TypedJSON.stringify(item[0]), TypedJSON.stringify(item[1])]),
                String, String
            );
            delete json.filter;
        }
        if (json.hasOwnProperty('fields')) {
            json.fields = DeserializationHelper.array<Field>(json.fields, Field);
        }

        return Object.assign(Object.create(Parameter.prototype), json);
    }

    // toJSON() {
    //     return Object.assign({}, this, {
    //         filter: SerializationHelper.map<String, String>(this.where),
    //         fields: SerializationHelper.array<Field>(this.fields)
    //     });
    // }
}
