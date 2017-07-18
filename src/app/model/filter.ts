import { JsonMember, JsonObject } from 'typedjson-npm/src/typed-json';

import { Value } from './value';

@JsonObject
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

    public isEmpty(): boolean {
        return this.values.length === 0;
    }

    public isPseudo(): boolean {
        return this.pseudo;
    }
}
