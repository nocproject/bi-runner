import { JsonObject, JsonMember } from 'typedjson-npm/src/typed-json';

import { Value } from './value';

@JsonObject
export class Filter {
    @JsonMember({elements: Value})
    public values: Value[];
    @JsonMember
    public condition: string;
    public type: string;
    public name: string;
    public association: string;
    public alias: string;
    // form data
    public valueFirst: string;
    public valueSecond: string;

    public isEmpty(): boolean {
        return this.values.length === 0;
    }
}
