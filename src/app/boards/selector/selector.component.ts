import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import * as _ from 'lodash';

import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';

import { APIService, DebugService } from '../../services';
import { Board, FilterBuilder, GroupBuilder, Methods, QueryBuilder, Value } from '../../model';
import { FilterService } from '../../services';

import { FilterFormComponent } from '../../filters/containers/form/filter-form.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bi-selector',
    templateUrl: './selector.component.html'
})
export class SelectorComponent implements AfterViewInit, OnInit, OnDestroy {
    @Input()
    board: Board;
    @ViewChild(FilterFormComponent) filters: FilterFormComponent;
    lastUpdate$: Observable<any>;

    collapsed = true;
    rangeForm: FormGroup;

    private rangeSubscription: Subscription;

    constructor(private api: APIService,
                public debug: DebugService,
                private filterService: FilterService) {
    }

    ngAfterViewInit() {
        this.filterChangeSub();
    }

    ngOnDestroy(): void {
        this.rangeSubscription.unsubscribe();
    }

    ngOnInit() {
        this.rangeForm = new FormGroup({
                startDate: new FormControl(null),
                endDate: new FormControl(null)
            }
        );

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
        this.rangeSubscription = this.rangeForm.valueChanges
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
                                .values([new Value(data.startDate), new Value(data.endDate)])
                                .build()
                        ])
                        .build()
                );
            });
    }
}
