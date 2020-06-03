import { JsonProperty, Serializable } from 'typescript-json-serializer';
import { cloneDeep } from 'lodash';

import { Field } from './field';
import { Group } from './group';
import { Layout } from './layout';
import { BiRequest } from './bi-request';
import { Widget } from './widget';

@Serializable()
export class Board {
    @JsonProperty()
    public id: string;
    @JsonProperty()
    public layoutId: string;
    @JsonProperty()
    public title: string;
    @JsonProperty()
    public description: string;
    @JsonProperty()
    public datasource: string;
    @JsonProperty()
    public format: number;
    @JsonProperty()
    public sample: number;
    @JsonProperty()
    public owner: string;
    @JsonProperty()
    public created: string;
    @JsonProperty()
    public changed: string;
    @JsonProperty({type: Widget})
    public widgets: Widget[];
    @JsonProperty({type: Field, name: 'agv_fields'})
    public agvFields: Field[];
    @JsonProperty({type: Field, name: 'filter_fields'})
    public filterFields: Field[];
    @JsonProperty({type: Field, name: 'pseudo_fields'})
    public pseudoFields: Field[];
    @JsonProperty({type: Layout})
    public layout: Layout;
    @JsonProperty({name: 'export', type: BiRequest})
    public exportQry: BiRequest;
    @JsonProperty({type: Group})
    public groups: Group[];
    @JsonProperty()
    public filter: [];
    public isSample: boolean;

    // static fromJSON(json: any): Board {
    //     // const board = TypedJSON.parse(json, Board);
    //
    //     if (json.hasOwnProperty('filter')) {
    //         //*** error
    //         // board.filter = DeserializationHelper.map<String, Filter>(
    //         //     toPairs(json.filter).map(item => [TypedJSON.stringify(item[0]), item[1]]),
    //         //     String, Filter
    //         // );
    //     }
    //     return new Board();
    // }

    prepare() {
        // ToDo take from @JsonMember
        const obj = cloneDeep(this);
        obj.exportQry.setFields(obj.exportQry.getFields()
            .map(f => {
                if ('hide' in f && f.hide) {
                    f.hide = 'yes';
                } else {
                    f.hide = 'no';
                }
                return f;
            }));
        obj['agv_fields'] = this.agvFields;
        obj['filter_fields'] = this.filterFields;
        obj['export'] = obj.exportQry;
        obj['pseudo_fields'] = this.pseudoFields;
        delete obj['agvFields'];
        delete obj['filterFields'];
        delete obj['exportQry'];
        delete obj['pseudoFields'];

        return obj;
    }
}
