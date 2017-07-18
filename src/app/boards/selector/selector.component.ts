import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import * as _ from 'lodash';

import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';

import { APIService, DebugService, FilterService } from '../../services';
import { Board, FilterBuilder, GroupBuilder, Methods, QueryBuilder, Value } from '../../model';

import { FilterFormComponent } from '../../filters/containers/form/filter-form.component';
import { EventService } from '../../filters/services/event.service';
import { EventType } from '../../filters/models/event.interface';
import { Group } from '../../model/group';
import { DatetimeRangeComponent } from '../../shared/datetime-range/datetime-range.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bi-selector',
    templateUrl: './selector.component.html'
})
export class SelectorComponent implements AfterViewInit, OnInit, OnDestroy {
    public START_DATE = 'startDate';
    public END_DATE = 'endDate';

    @Input()
    board: Board;
    @ViewChild(FilterFormComponent)
    filters: FilterFormComponent;
    @ViewChild(DatetimeRangeComponent)
    rangeForm: DatetimeRangeComponent;
    lastUpdate$: Observable<any>;

    collapsed = true;

    private rangeSubscription: Subscription;
    private eventSubscription: Subscription;

    constructor(public debug: DebugService,
                private api: APIService,
                private eventService: EventService,
                private filterService: FilterService) {
    }

    ngAfterViewInit() {
        this.filterChangeSub();
    }

    ngOnDestroy(): void {
        this.rangeSubscription.unsubscribe();
        this.eventSubscription.unsubscribe();
    }

    ngOnInit() {
        this.lastUpdate$ = this.api.execute(
            new QueryBuilder()
                .method(Methods.QUERY)
                .params([{
                    fields: [
                        {
                            expr: 'max(date)',
                            alias: 'date'
                        }
                    ],
                    datasource: this.board.datasource
                }])
                .build())
            .flatMap(response => _.first(response.data['result']));
    }

    submitFilters(value: { [name: string]: any }) {
        console.log(value);
    }

    private filterChangeSub() {
        this.rangeSubscription = this.rangeForm.changes
            .filter(() => this.rangeForm.valid)
            .subscribe(data => {
                this.filterService.filtersNext(
                    new GroupBuilder()
                        .name('startEnd')
                        .filters([
                            new FilterBuilder()
                                .name('ts')
                                .type('DateTime')
                                .condition('interval')
                                .values([new Value(data[this.START_DATE]), new Value(data[this.END_DATE])])
                                .build()
                        ])
                        .build()
                );
            });
        this.eventSubscription = this.eventService.event$
            .filter(event => event !== null)
            .filter(event => event.type === EventType.Restore)
            .flatMap(event => event.value)
            .filter((group: Group) => group.name === 'startEnd')
            .subscribe(
                (group: Group) => {
                    this.rangeForm.restoreValue({
                        [this.START_DATE]: new Date(group.filters[0].values[0].value),
                        [this.END_DATE]: new Date(group.filters[0].values[1].value)
                    });
                }
            );
    }
}
