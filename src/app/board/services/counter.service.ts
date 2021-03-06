import { Injectable } from '@angular/core';

import { Observable ,  of } from 'rxjs';
import { map } from 'rxjs/operators';

import { cloneDeep, flattenDeep, head } from 'lodash';

import { BiRequestBuilder, Board, Group, Methods, Result, WhereBuilder } from '@app/model';
import { APIService } from '@app/services';
import { FilterService } from './filter.service';
import { FieldsTableService } from './fields-table.service';


@Injectable()
export class CounterService {
    constructor(private api: APIService,
                private fieldsTableService: FieldsTableService,
                private filterService: FilterService) {
    }

    public sampleExport(board: Board): Observable<any[]> {
        const emptyValue = {data: {result: []}};
        return this.execQuery(board,
            (params) => {
                const cloned = cloneDeep(params);
                const fields = board.exportQry.getFields();

                if (fields) cloned['fields'] = fields;
                else cloned['fields'] = undefined;

                return cloned;
            }, emptyValue)
            .pipe(
                map((response: Result) => response.zip(false))
            );
    }

    public qty(board: Board): Observable<number> {
        const emptyValue = {data: {result: []}};
        return this.execQuery(board, this.uniqFields, emptyValue)
            .pipe(
                map(response => response.data.result.length ? head(flattenDeep(response.data.result)) : 0)
            );
    }

    private queryCondition(params) {
        const cloned = cloneDeep(params);
        const filters: Group[] = this.filterService.allFilters();
        const where = WhereBuilder.makeWhere(filters, true);
        const having = WhereBuilder.makeWhere(filters, false);

        if (where) {
            cloned['filter'] = where;
        }

        if (having) {
            cloned['having'] = having;
        }

        return cloned;
    }

    private uniqFields(params) {
        const cloned = cloneDeep(params);
        const fields = this.fieldsTableService.allFields()
            .filter(field => field.hasOwnProperty('group'))
            .map(field => {
                return {$field: `${field.expr}`};
            });
        if (fields.length) {
            cloned['fields'] = [
                {
                    expr: {
                        $uniqExact: fields
                    },
                    alias: 'qty'
                }
            ];
        } else {
            cloned['fields'] = undefined;
        }
        return cloned;
    }

    private execQuery(board: Board, getFields, emptyValue): Observable<Result> {
        let params = {
            datasource: board.datasource,
            limit: 15
        };

        params = getFields.call(this, params);

        if (!params['fields']) {
            return of(emptyValue);
        }

        params = this.queryCondition(params);

        const query = new BiRequestBuilder()
            .method(Methods.QUERY)
            .params([params])
            .build();
        return this.api.execute(query);
    }
}
