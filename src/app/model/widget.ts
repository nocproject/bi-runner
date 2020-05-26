// import { JsonMember, JsonObject } from '@upe/typedjson';

import { Map } from './map';
import { BiRequest } from './bi-request';

// @JsonObject()
export class Widget {
    // @JsonMember()
    public id: number;
    // @JsonMember()
    public cell: string;
    // @JsonMember()
    public note: string;
    // @JsonMember()
    public title: string;
    // @JsonMember({name: 'type'})
    public type: string;
    // @JsonMember()
    public query: BiRequest;
    // @JsonMember()
    public map?: Map;
}
