import { JsonObject, JsonMember } from 'typedjson-npm/src/typed-json';

import { Filter } from './filter';

@JsonObject()
export class Group {
    @JsonMember
    name: string;
    @JsonMember
    association: '$and' | '$or';
    @JsonMember({elements: Filter})
    filters: Filter[];

    // public isEmpty(): boolean {
    //     this.filters.reduce((prev, cur)=>prev+cur.)
    //     return this.filters.length === 0;
    // }
}
