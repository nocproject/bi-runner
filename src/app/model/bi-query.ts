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

@JsonObject({initializer: BiQuery.fromJSON})
export class BiQuery {
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
    public having: {};

    static fromJSON(json: any): BiQuery {
        function extract(name) {
            if (json.hasOwnProperty(name)) {
                json[name] = DeserializationHelper.map<String, String>(
                    toPairs(json[name]).map(item => [TypedJSON.stringify(item[0]), TypedJSON.stringify(item[1])]),
                    String, String
                );
                delete json[name];
            }
        }
        extract('filter');
        extract('having');
        if (json.hasOwnProperty('fields')) {
            json.fields = DeserializationHelper.array<Field>(json.fields, Field);
        }

        return Object.assign(Object.create(BiQuery.prototype), json);
    }

    // toJSON() {
    //     return Object.assign({}, this, {
    //         filter: SerializationHelper.map<String, String>(this.where),
    //         fields: SerializationHelper.array<Field>(this.fields)
    //     });
    // }
}
