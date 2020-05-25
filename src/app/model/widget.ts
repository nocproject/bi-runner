import { JsonProperty, Serializable } from 'typescript-json-serializer';

import { Map } from './map';
import { BiRequest } from './bi-request';

@Serializable()
export class Widget {
    @JsonProperty()
    public id: number;
    @JsonProperty()
    public cell: string;
    @JsonProperty()
    public note: string;
    @JsonProperty()
    public title: string;
    @JsonProperty()
    public type: string;
    @JsonProperty({type: BiRequest})
    public query: BiRequest;
    @JsonProperty({type: Map})
    public map?: Map;
}
