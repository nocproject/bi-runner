import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, publishReplay, refCount, switchMap } from 'rxjs/operators';

import { cloneDeep, findIndex, head } from 'lodash';

import { APIService } from './api.service';

import { BiRequestBuilder, Board, Datasource, Field, IOption, Methods } from '@app/model';
import { BoardService } from './board.service';
import { FilterService } from '../board/services/filter.service';

@Injectable()
export class DatasourceService {
    datasource$: Observable<Datasource>;

    constructor(private api: APIService,
                private boardService: BoardService,
                private filterService: FilterService
    ) {
        this.datasource$ = this.boardService.board$
            .pipe(
                switchMap((board: Board) => {
                    return this.api.execute(
                        new BiRequestBuilder()
                            .method(Methods.GET_DATASOURCE_INFO)
                            .params([board.datasource])
                            .build()).pipe(
                        map(response => {
                            const datasource = Datasource.fromJSON(response.result);
                            datasource.origFields = cloneDeep(datasource.fields);
                            datasource.fields = this._fields(board, board.filterFields, datasource);
                            datasource.tableFields = this._fields(board, board.agvFields, datasource);
                            this.filterService.fields = datasource.fields;
                            return datasource;
                        }));
                }),
                publishReplay(1),
                refCount()
            );
    }

    name(): Observable<string> {
        return this.datasource$.pipe(map(d => d.name));
    }

    isSample(): Observable<boolean> {
        return this.datasource$.pipe(map(d => d.sample));
    }

    fields(): Observable<Field[]> {
        return this.datasource$.pipe(map(d => d.fields));
    }

    tableFields(): Observable<Field[]> {
        return this.datasource$.pipe(map(d => d.tableFields));
    }

    fieldByName(name: string): Observable<Field> {
        console.log(name);
        return this.datasource$.pipe(map(d => d.getFieldByName(name)));
    }

    fieldsAsOption(): Observable<IOption[]> {
        return this.fields()
            .pipe(
                map(array => array
                    .filter(field => field.isSelectable)
                    .map(field => {
                            return {
                                value: `${field.name}`,
                                text: field.description
                            };
                        }
                    )
                )
            );
    }

    newFieldsAsOption(): Observable<IOption[]> {
        return this.boardService.board$
            .pipe(
                switchMap((board: Board) => {
                    return this.datasource$.pipe(map(d => d.origFields))
                        .pipe(
                            map(array => array
                                .filter(field => field.isSelectable)
                                .filter(field => findIndex(board.agvFields, e => e.name === field.name) === -1)
                                .map(field => {
                                        return {
                                            value: `${field.name}`,
                                            text: field.description
                                        };
                                    }
                                )
                            )
                        );
                }),
                publishReplay(1),
                refCount()
            );
    }

    private _fields(board: Board, fields: Field[], datasource: Datasource): Field[] {
        return datasource.fields
            .concat(board.pseudoFields)
            .map(field => {
                let index = findIndex(fields, e => e.name === field.name);

                if (index === -1) {
                    field.isSelectable = false;
                    field.group = 999;
                } else {
                    field.group = fields[index].group;
                }

                if (!field.description) {
                    field.description = field.name;
                }

                if (field.dict) {
                    field.datasource = board.datasource;
                    if ('administrative_domain' === field.name) {
                        field.type = 'tree-' + field.dict;
                    } else {
                        field.type = 'dict-' + field.dict;
                    }
                }

                if (field.model) {
                    field.type = 'model-' + field.model.replace('.', '_');
                    field.datasource = board.datasource;
                    field.pseudo = false;
                }

                if ('UInt32' === field.type && 'ip' === field.name) {
                    field.type = 'IPv4';
                }

                if (field.type.startsWith('Nested')) {
                    field.type = 'Nested';
                }

                if (!field.pseudo) {
                    field.pseudo = false;
                }

                index = findIndex(board.agvFields, e => e.name === field.name);

                if (index === -1) {
                    field.isGrouping = false;
                } else {
                    field.aggFunc = board.agvFields[index].aggFunc;
                    field.enable = board.agvFields[index].enable !== false;
                }

                index = findIndex(
                    head(board.exportQry.params).fields, e => (e.alias ? e.alias : e.expr) === field.name);

                if (index !== -1) {
                    field.grouped = true;
                }
                return field;
            })
            .sort((n1, n2) => {
                if (`${n1.group}x${n1.description}` > `${n2.group}x${n2.description}`) {
                    return 1;
                } else {
                    return -1;
                }
            });
    }
}
