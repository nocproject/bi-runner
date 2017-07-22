import { JsonMember, JsonObject } from 'typedjson-npm/src/typed-json';

import { Value } from './value';

@JsonObject({initializer: Filter.fromJSON})
export class Filter {
    @JsonMember({elements: Value})
    public values: Value[];
    @JsonMember
    public condition: string;
    @JsonMember
    public type: string;
    @JsonMember
    public name: string;
    @JsonMember
    public association: '$and' | '$or';
    @JsonMember
    public alias: string;
    @JsonMember
    public pseudo: boolean;
    // form data
    public valueFirst: string;
    public valueSecond: string;
    public hide: string;
    @JsonMember
    public datasource: string;

    public isEmpty(): boolean {
        return this.values.length === 0;
    }

    public isPseudo(): boolean {
        return this.pseudo;
    }

    static fromJSON(json: any): Filter {
        if (json.hasOwnProperty('type') && json.hasOwnProperty('values')) {
            if (json.type.match(/Date/)) {
                if (!json.condition.match(/periodic/)) {
                    json.values[0].value = new Date(json.values[0].value);
                }
                if (json.condition.match(/interval/) && !json.condition.match(/periodic/)) {
                    json.values[1].value = new Date(json.values[1].value);
                }
            }
        }
        return Object.assign(Object.create(Filter.prototype), json);
    }
}
