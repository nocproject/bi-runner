import { Injectable } from '@angular/core';

import { flattenDeep, head } from 'lodash';
import { Observable } from 'rxjs/Rx';

import { APIService } from '@app/services';
import { FilterService } from './filter.service';
import { FieldsTableService } from './fields-table.service';

import { BiRequestBuilder, Board, Field, Group, Methods, WhereBuilder } from '@app/model';

@Injectable()
export class CounterService {
    constructor(private api: APIService,
                private fieldsTableService: FieldsTableService,
                private filterService: FilterService) {
    }

    public qty(array: any, board: Board): Observable<number> {
        let fields: Field[];
        let filters: Group[];

        if (head(array) instanceof Field) {
            fields = (<Field[]>array);
            filters = this.filterService.allFilters();
        }
        if (head(array) instanceof Group) {
            filters = (<Group[]>array);
            fields = this.fieldsTableService.allFields();
        }

        return this.makeUniqQuery(board, fields, filters);
    }

    private makeUniqQuery(board: Board, groups: Field[], filters: Group[]): Observable<number> {
        const where = WhereBuilder.makeWhere(filters, true);
        const having = WhereBuilder.makeWhere(filters, false);
        const fields = groups
            .filter(field => field.hasOwnProperty('group'))
            .map(field => field.expr)
            .join(',');
        const params = {
            datasource: board.datasource,
            fields: [
                {
                    expr: `uniq(${fields})`,
                    alias: 'qty'
                }
            ]
        };

        if (!fields) {
            return Observable.of(0);
        }

        if (where) {
            params['filter'] = where;
        }

        if (having) {
            params['having'] = having;
        }

        const query = new BiRequestBuilder()
            .method(Methods.QUERY)
            .params([params])
            .build();
        return this.api.execute(query)
            .map(response => response.data.result.length ? head(flattenDeep(response.data.result)) : 0);
    }
}
