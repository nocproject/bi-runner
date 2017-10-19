import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import * as _ from 'lodash';

import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../../environments/environment';
import { APIService, DebugService, FilterService } from '../../services';
import { Board, FilterBuilder, Group, GroupBuilder, Methods, QueryBuilder, Value } from '../../model';

import { FilterFormComponent } from '../../filters/containers/form/filter-form.component';
import { EventService } from '../../filters/services';
import { EventType } from '../../filters/models';
import { DatetimeRangeComponent } from '../../shared/datetime-range/datetime-range.component';

@Component({
    // changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bi-selector',
    templateUrl: './selector.component.html'
})
export class SelectorComponent implements AfterViewInit, OnInit, OnDestroy {
    private rangeSubscription: Subscription;
    private eventSubscription: Subscription;
    private ratioSubscription: Subscription;

    @Input()
    board: Board;
    @ViewChild(FilterFormComponent)
    filters: FilterFormComponent;
    @ViewChild(DatetimeRangeComponent)
    rangeForm: DatetimeRangeComponent;

    START_DATE = 'startDate';
    END_DATE = 'endDate';
    production = environment.production;
    lastUpdate$: Observable<any>;

    ratioForm: FormGroup;
    ratio: FormControl;

    collapsed = true;

    constructor(public debug: DebugService,
                private fb: FormBuilder,
                private api: APIService,
                private eventService: EventService,
                private filterService: FilterService) {
        this.ratio = new FormControl(this.filterService.ratioSubject.getValue());
    }

    ngAfterViewInit() {
        this.ratio.setValue(this.filterService.ratioSubject.getValue());
        this.filterChangeSub();
    }

    ngOnDestroy(): void {
        this.rangeSubscription.unsubscribe();
        this.eventSubscription.unsubscribe();
        this.ratioSubscription.unsubscribe();
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

        this.ratioForm = this.fb.group({
            ratio: this.filterService.ratioSubject.getValue()
        });
        this.ratioSubscription = this.ratioForm.valueChanges.subscribe(data => {
            this.filterService.ratioSubject.next(+data.ratio);
            this.filterService.initFilters(this.filterService.allFilters());
        });
    }

    onChangeRatio(value) {
        this.ratioForm.setValue({ratio: value});
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
