import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import * as _ from 'lodash';

import { APIService, FilterService } from '../../../services';
import { Board, Field, Group, Methods, QueryBuilder, Result, WhereBuilder } from '../../../model';

@Component({
    selector: 'bi-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.sass']
})
export class CounterComponent implements OnInit, OnDestroy {

    @Input()
    board: Board;

    qty$: Observable<number>;
    groupsSubscription: Subscription;
    filtersSubscription: Subscription;

    constructor(private api: APIService,
                private filterService: FilterService) {
    }

    ngOnInit() {
        this.qty$ = this.filterService.qty$;
        this.groupsSubscription = this.filterService.groups$
            .switchMap(groups => this.makeUniqQuery(groups, this.filterService.allFilters()))
            .subscribe(response => this.filterService.qtySubject.next(_.first(_.first(response.data['result']))));
        this.filtersSubscription = this.filterService.filters$
            .switchMap(filters => this.makeUniqQuery(this.filterService.allGroups(), filters))
            .subscribe(response => this.filterService.qtySubject.next(_.first(_.first(response.data['result']))));
    }

    ngOnDestroy(): void {
        this.filtersSubscription.unsubscribe();
        this.groupsSubscription.unsubscribe();
    }

    private makeUniqQuery(groups: Field[], filters: Group[]): Observable<Result> {
        const where = WhereBuilder.makeWhere(filters);
        const fields = groups.filter(field => field.hasOwnProperty('group'))
            .map(field => field.expr)
            .join(',');
        const params = {
            datasource: this.board.datasource,
            fields: [
                {
                    expr: `uniq(${fields})`,
                    alias: 'qty'
                }
            ]
        };
        if (!fields) {
            const response = new Result();

            response.data = {result: [['0']]};
            return Observable.of(response);
        }

        if (where) {
            params['filter'] = where;
        }

        const query = new QueryBuilder()
            .method(Methods.QUERY)
            .params([params])
            .build();
        return this.api.execute(query);
    }
}