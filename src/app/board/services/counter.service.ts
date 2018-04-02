import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { cloneDeep, flattenDeep, head } from 'lodash';

import { APIService } from '@app/services';
import { FilterService } from './filter.service';
import { FieldsTableService } from './fields-table.service';

import { BiRequestBuilder, Board, Group, Methods, Result, WhereBuilder } from '@app/model';

@Injectable()
export class CounterService {
    constructor(private api: APIService,
                private fieldsTableService: FieldsTableService,
                private filterService: FilterService) {
    }

    public sampleExport(board: Board): Observable<any[]> {
        return this.execQuery(board,
            (params) => {
                const cloned = cloneDeep(params);
                const fields = board.exportQry.getFields();

                if (fields) cloned['fields'] = fields;
                else cloned['fields'] = undefined;

                return cloned;
            },
            [])
            .map((response: Result) => response.zip(false));
    }

    public qty(board: Board): Observable<number> {
        return this.execQuery(board, this.uniqFields, 0)
            .map(response => response.data.result.length ? head(flattenDeep(response.data.result)) : 0);
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
            .map(field => field.expr)
            .join(',');

        if (fields) {
            cloned['fields'] = [
                {
                    expr: `uniq(${fields})`,
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
