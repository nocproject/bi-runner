import { Injectable } from '@angular/core';

import { findIndex, head } from 'lodash';
import { Observable } from 'rxjs/Observable';

import { APIService } from '@app/services';
import { BoardResolver } from './board.resolver';
import { FilterService } from './filter.service';

import { BiRequestBuilder, Board, Datasource, Field, IOption, Methods } from '@app/model';

@Injectable()
export class DatasourceService {
    datasource$: Observable<Datasource>;

    constructor(private api: APIService,
                private boardResolver: BoardResolver,
                private filterService: FilterService) {
        this.datasource$ = this.boardResolver.board$
            .switchMap((board: Board) => {
                return this.api.execute(
                    new BiRequestBuilder()
                        .method(Methods.GET_DATASOURCE_INFO)
                        .params([board.datasource])
                        .build())
                    .map(response => {
                        const datasource = Datasource.fromJSON(response.result);
                        datasource.fields = this._fields(board, datasource);
                        this.filterService.fields = datasource.fields;
                        return datasource;
                    });
            })
            .publishLast()
            .refCount();
    }

    name(): Observable<string> {
        return this.datasource$.map(d => d.name);
    }

    isSample(): Observable<boolean> {
        return this.datasource$.map(d => d.sample);
    }

    fields(): Observable<Field[]> {
        return this.datasource$.map(d => d.fields);
    }

    fieldsAsOption(): Observable<IOption[]> {
        return this.fields()
            .map(array => array
                .filter(field => field.isSelectable)
                .map(field => {
                        return {
                            value: `${field.name}`,
                            text: field.name
                        };
                    }
                )
            );
    }

    private _fields(board: Board, datasource: Datasource): Field[] {
        return datasource.fields
            .concat(board.pseudoFields)
            .map(field => {
                let index = findIndex(board.filterFields, e => e.name === field.name);

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
