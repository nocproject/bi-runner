import { JsonMember } from 'typedjson-npm/src/typed-json';

import { Filter } from './filter';

export class Group {
    @JsonMember
    name: string;
    @JsonMember
    association: string;
    @JsonMember({elements: Filter})
    filters: Filter[];
}
