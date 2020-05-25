import { JsonProperty, Serializable } from 'typescript-json-serializer';

import { Filter } from './filter';

@Serializable()
export class Group {
    @JsonProperty()
    name: string;
    @JsonProperty()
    active: boolean;
    @JsonProperty()
    association: '$and' | '$or';
    @JsonProperty()
    public range: boolean;
    @JsonProperty({type: Filter})
    filters: Filter[];

    // public isEmpty(): boolean {
    //     this.filters.reduce((prev, cur)=>prev+cur.)
    //     return this.filters.length === 0;
    // }
}
