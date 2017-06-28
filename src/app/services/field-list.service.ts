import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';

import { APIService } from './api.service';
import { Board, Field, QueryBuilder, Methods } from '../model';
import { IOption } from '../model/ioption';

@Injectable()
export class FieldListService {

    private fields$: Observable<Field[]>;

    constructor(private api: APIService) {
    }

    init(board: Board): void {
        this.fields$ = this.api.execute(
            new QueryBuilder()
                .method(Methods.GET_DATASOURCE_INFO)
                .params([board.datasource])
                .build())
            .flatMap(result => result.data['fields'])
            .map(item => Field.fromJSON(item))
            .map(field => {
                const index = _.findIndex(board.filterFields, e => e.name === field.name);

                if (index === -1) {
                    field.isSelectable = false;
                    field.group = 999;
                } else {
                    field.group = board.filterFields[index].group;
                }

                if (!field.description) {
                    field.description = field.name;
                }

                if (field.dict) {
                    if ('administrative_domain' === field.name) {
                        field.type = 'tree-' + field.dict;
                    }
                    field.type = 'dict-' + field.dict;
                }

                if ('UInt32' === field.type && 'ip' === field.name) {
                    field.type = 'IPv4';
                }

                return field;
            })
            .map(field => {
                if (_.findIndex(board.agvFields, e => e.name === field.name) === -1) {
                    field.isGrouping = false;
                }
                return field;
            })
            .map(field => {
                const index = _.findIndex(
                    _.first(board.exportQry.params).fields, e => (e.alias ? e.alias : e.expr) === field.name);

                if (index !== -1) {
                    field.grouped = true;
                }
                return field;
            })
            .toArray()
            .map(fields => fields
                .sort((n1, n2) => {
                    if (`${n1.group}x${n1.description}` > `${n2.group}x${n2.description}`) {
                        return 1;
                    } else {
                        return -1;
                    }
                }))
            .publishReplay(1)
            .refCount();
    }

    getFieldList(): Observable<Field[]> {
        return this.fields$;
    }

    getAsOption(): Observable<IOption[]> {
        return this.fields$
            .map(array => array
                .map(field => {
                        return {value: `${field.name}.${field.type}`, text: field.description};
                    }
                )
            );
    }
}