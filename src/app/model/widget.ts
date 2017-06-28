import { JsonObject, JsonMember } from 'typedjson-npm/src/typed-json';

import { Query } from './query';

@JsonObject
export class Widget {
    @JsonMember
    public id: number;
    @JsonMember
    public cell: string;
    @JsonMember
    public note: string;
    @JsonMember
    public title: string;
    @JsonMember({name: 'type'})
    public type: string;
    @JsonMember
    public query: Query;
}