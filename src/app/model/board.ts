import { TypedJSON, JsonObject, JsonMember } from 'typedjson-npm/src/typed-json';
import * as _ from 'lodash';

import { Field } from './field';
import { Filter } from './filter';
import { Group } from './group';
import { Layout } from './layout';
import { Query } from './query';
import { Widget } from './widget';
import { DeserializationHelper } from './helpers';

@JsonObject()
export class Board {
    @JsonMember
    public id: string;
    @JsonMember
    public layoutId: string;
    @JsonMember
    public title: string;
    @JsonMember
    public description: string;
    @JsonMember
    public datasource: string;
    @JsonMember
    public format: number;
    @JsonMember
    public owner: string;
    @JsonMember
    public created: string;
    @JsonMember
    public changed: string;
    @JsonMember({elements: Widget})
    public widgets: Widget[];
    @JsonMember({elements: Field, name: 'agv_fields'})
    public agvFields: Field[];
    @JsonMember({elements: Field, name: 'filter_fields'})
    public filterFields: Field[];
    @JsonMember({elements: Field, name: 'pseudo_fields'})
    public pseudoFields: Field[];
    @JsonMember
    public layout: Layout;
    @JsonMember({name: 'export'})
    public exportQry: Query;
    @JsonMember({elements: Group})
    public groups: Group[];
    // version 0.2, may be
    // @JsonMapMember(String, Filter)
    public filter: Map<String, Filter>;

    static fromJSON(json: any): Board {
        const board = TypedJSON.parse(json, Board);
        if (json.hasOwnProperty('filter')) {
            board.filter = DeserializationHelper.map<String, Filter>(
                _.toPairs(json.filter).map(item => [TypedJSON.stringify(item[0]), item[1]]),
                String, Filter
            );
        }
        return board;
    }

    prepare() {
        // DoTo take from @JsonMember
        const obj = Object.assign({}, this,
            {
                agv_fields: this.agvFields,
                filter_fields: this.filterFields,
                'export': this.exportQry,
                pseudo_fields: this.pseudoFields
            });
        delete obj['agvFields'];
        delete obj['filterFields'];
        delete obj['exportQry'];
        delete obj['pseudoFields'];

        return obj;
    }
}
