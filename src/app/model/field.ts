import { JsonMember, JsonObject } from '@upe/typedjson';

import { Expression } from './expression';

@JsonObject({initializer: Field.fromJSON, knownTypes: [Expression]})
export class Field {
    // @JsonMember
    public expr: Expression | string;
    @JsonMember()
    public label: string;
    @JsonMember()
    public alias: string;
    @JsonMember()
    public desc: boolean;
    @JsonMember({type: Number})
    public order: number;
    @JsonMember({type: Number})
    public group: number;
    @JsonMember()
    public format: string;
    @JsonMember()
    public name: string;
    @JsonMember()
    public description: string;
    @JsonMember()
    public dict: string;
    @JsonMember()
    public type: string;
    @JsonMember()
    public model: string;
    @JsonMember()
    public pseudo: boolean;
    //
    public hide: boolean;
    public isSelectable: boolean;
    public isGrouping: boolean;
    public grouped: boolean;
    public datasource: string;

    public isSortable(): boolean {
        return 'desc' in this;
    }

    static fromJSON(json) {
        if (json.hasOwnProperty('expr')) {
            if (typeof json['expr'] === 'object') {
                json['expr'].__type = 'Expression';
            }
        }
        if (json.hasOwnProperty('hide')) {
            json['hide'] = json['hide'] === 'yes' || json['hide'] === 'true';
        }
        json['isSelectable'] = true;
        json['isGrouping'] = true;
        json['grouped'] = false;
        return Object.assign(Object.create(Field.prototype), json);
    }
}
