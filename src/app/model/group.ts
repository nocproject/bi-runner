import { JsonMember, JsonObject } from '@upe/typedjson';

import { Filter } from './filter';

@JsonObject()
export class Group {
    @JsonMember()
    name: string;
    @JsonMember()
    active: boolean;
    @JsonMember()
    association: '$and' | '$or';
    @JsonMember()
    public range: boolean;
    @JsonMember({elements: Filter})
    filters: Filter[];

    // public isEmpty(): boolean {
    //     this.filters.reduce((prev, cur)=>prev+cur.)
    //     return this.filters.length === 0;
    // }
}
