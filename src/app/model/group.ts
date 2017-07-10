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
}
