import { JsonProperty, Serializable } from 'typescript-json-serializer';

import { Cell } from './cell';

@Serializable()
export class Layout {
    @JsonProperty()
    public id: string;
    @JsonProperty()
    public name: string;
    @JsonProperty()
    public description: string;
    @JsonProperty()
    public uuid: string;
    @JsonProperty({type: Cell})
    public cells: Cell[];
    @JsonProperty({name: 'fav_status'})
    public favStatus: boolean;
    @JsonProperty({name: 'is_builtin'})
    public isBuiltin: boolean;
}
