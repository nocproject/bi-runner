// import { JsonMember, JsonObject } from '@upe/typedjson';

import { Cell } from './cell';

// @JsonObject()
export class Layout {
    // @JsonMember()
    public id: string;
    // @JsonMember()
    public name: string;
    // @JsonMember()
    public description: string;
    // @JsonMember()
    public uuid: string;
    // @JsonMember({elements: Cell})
    public cells: Cell[];
    // @JsonMember({name: 'fav_status'})
    public favStatus: boolean;
    // @JsonMember({name: 'is_builtin'})
    public isBuiltin: boolean;
}
