import { forwardRef, Inject, Injectable } from '@angular/core';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Rx';

import { APIService } from './api.service';
import { FilterService } from './filter.service';

import { BiRequestBuilder, Board, Field, Group, Methods, WhereBuilder } from '@app/model';

@Injectable()
export class CounterService {
    constructor(private api: APIService,
                @Inject(forwardRef(() => FilterService)) private filterService: FilterService) {
    }

    public qty(array: Field[] | Group[], board: Board): Observable<number> {
        let groups: Field[];
        let filters: Group[];

        if (_.first(array) instanceof Field) {
            groups = (<Field[]>array);
            filters = this.filterService.allFilters();
        }
        if (_.first(array) instanceof Group) {
            filters = (<Group[]>array);
            groups = this.filterService.allGroups();
        }

        return this.makeUniqQuery(board, groups, filters);
    }

    private makeUniqQuery(board: Board, groups: Field[], filters: Group[]): Observable<number> {
        const where = WhereBuilder.makeWhere(filters);
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

        const query = new BiRequestBuilder()
            .method(Methods.QUERY)
            .params([params])
            .build();
        return this.api.execute(query)
            .map(response => response.data.result.length ? _.first(_.flattenDeep(response.data.result)) : 0);
    }
}
