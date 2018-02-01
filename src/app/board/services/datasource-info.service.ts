import { forwardRef, Inject, Injectable } from '@angular/core';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

import { APIService } from '@app/services/index';
import { BoardResolver } from './board.resolver';

import { Board, Datasource, Field, IOption, Methods, BiRequestBuilder } from '@app/model/index';

@Injectable()
export class DatasourceService {
    datasource$: Observable<Datasource>;

    constructor(@Inject(forwardRef(() => APIService)) private api: APIService,
                @Inject(forwardRef(() => BoardResolver)) private boardResolver: BoardResolver) {
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
                        const ds = field.datasource ? field.datasource : 'none';
                        return {
                            value: `${field.name}.${field.type}.${field.pseudo}.${ds}`,
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
                let index = _.findIndex(board.filterFields, e => e.name === field.name);

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

                index = _.findIndex(board.agvFields, e => e.name === field.name);

                if (index === -1) {
                    field.isGrouping = false;
                }

                index = _.findIndex(
                    _.first(board.exportQry.params).fields, e => (e.alias ? e.alias : e.expr) === field.name);

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
