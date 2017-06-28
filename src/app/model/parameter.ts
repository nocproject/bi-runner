import { JsonObject, JsonMember, TypedJSON } from 'typedjson-npm/src/typed-json';
import * as _ from 'lodash';

import { Field } from './field';
import { DeserializationHelper, SerializationHelper } from './helpers';

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
    @JsonMember
    public datasource: string;
    @JsonMember
    public limit: number;
    public fields: Field[];
    // @JsonMapMember({elements: [String, String], name: 'filter'})
    // public where: Map<String, String>;
    public filter: {};

    static fromJSON(json: any): Parameter {
        if (json.hasOwnProperty('filter')) {
            json.filter = DeserializationHelper.map<String, String>(
                _.toPairs(json.filter).map(item => [TypedJSON.stringify(item[0]), item[1]]),
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
