import {
    AfterViewInit, ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import * as _ from 'lodash';

import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';

import { APIService } from '../../services';
import { Board, FilterBuilder, GroupBuilder, Methods, QueryBuilder, Value } from '../../model';
import { FieldListService, FilterService } from '../../services';

import { FilterFormComponent } from '../../filters/containers/form/filter-form.component';
import { FormConfig } from '../../filters/models/form-config.interface';
import { ConditionService } from '../../filters/services';
import { BIValidators } from '../../filters/components/validators';
import { DebugService } from '../../services/debug.service';
import { FormData } from '../../filters/models/form-data.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bi-selector',
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.scss']
})
export class SelectorComponent implements AfterViewInit, OnInit, OnDestroy {
    @Input()
    board: Board;
    @ViewChild(FilterFormComponent) filters: FilterFormComponent;
    lastUpdate$: Observable<any>;

    collapsed = true;
    rangeForm: FormGroup;

    config: FormConfig;

    private rangeSubscription: Subscription;
    private formSubscription: Subscription;

    constructor(public debug: DebugService,
                private api: APIService,
                private filterService: FilterService,
                private fieldList: FieldListService,
                private conditionService: ConditionService) {
    }

    ngAfterViewInit() {
        this.filterChangeSub();
    }

    ngOnDestroy(): void {
        this.rangeSubscription.unsubscribe();
        this.formSubscription.unsubscribe();
    }

    ngOnInit() {
        this.rangeForm = new FormGroup({
                startDate: new FormControl(null),
                endDate: new FormControl(null)
            }
        );

        // console.log(this.filters.valid);

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

        // ToDo remove after testing
        this.config = {
            groups: [{
                //     association: '$or',
                //     group: {
                //         association: '$and',
                //         filters: [
                //             [{
                //                 name: 'name',
                //                 type: 'select',
                //                 value: 'date.Date',
                //                 validation: [Validators.required],
                //                 label: 'Field',
                //                 placeholder: 'Select field',
                //                 options: this.fieldList.getAsOption()
                //             }, {
                //                 name: 'condition',
                //                 type: 'select',
                //                 value: '$eq',
                //                 validation: [Validators.required],
                //                 label: 'Condition',
                //                 placeholder: 'Select Condition',
                //                 options: this.conditionService.conditions('Date')
                //             }], [{
                //                 name: 'name',
                //                 type: 'select',
                //                 value: 'container.dict-container',
                //                 validation: [Validators.required],
                //                 label: 'Field',
                //                 placeholder: 'Select field',
                //                 options: this.fieldList.getAsOption()
                //             }, {
                //                 name: 'condition',
                //                 type: 'select',
                //                 value: 'not.in',
                //                 validation: [Validators.required],
                //                 label: 'Condition',
                //                 placeholder: 'Select Condition',
                //                 options: this.conditionService.conditions('dict-container')
                //             }]
                //         ]
                //     }
                // }, {
                association: '$and',
                group: {
                    association: '$and',
                    filters: [
                        [{
                            name: 'name',
                            type: 'select',
                            value: 'reboots.Int16',
                            validation: [Validators.required],
                            label: 'Field',
                            placeholder: 'Select field',
                            options: this.fieldList.getAsOption()
                        }, {
                            name: 'condition',
                            type: 'select',
                            value: 'interval',
                            validation: [Validators.required],
                            label: 'Condition',
                            placeholder: 'Select Condition',
                            options: this.conditionService.conditions('reboots.Int16')
                        }, {
                            name: 'valueFirst',
                            type: 'inputMask',
                            mask: '999999999999',
                            value: '0',
                            validation: [Validators.required, BIValidators.maskNotEmpty],
                            label: 'From Value'
                        }, {
                            name: 'valueSecond',
                            type: 'inputMask',
                            mask: '999999999999',
                            value: '1',
                            validation: [Validators.required, BIValidators.maskNotEmpty],
                            label: 'To Value'
                            // }],
                            // [{
                            //     name: 'name',
                            //     type: 'select',
                            //     value: 'total_objects.Int64',
                            //     validation: [Validators.required],
                            //     label: 'Field',
                            //     placeholder: 'Select field',
                            //     options: this.fieldList.getAsOption()
                            // }, {
                            //     name: 'condition',
                            //     type: 'select',
                            //     value: 'interval',
                            //     validation: [Validators.required],
                            //     label: 'Condition',
                            //     placeholder: 'Select Condition',
                            //     options: this.conditionService.conditions('total_objects.Int64')
                            // }, {
                            //     name: 'valueFirst',
                            //     type: 'inputMask',
                            //     mask: '999999999999',
                            //     value: '0',
                            //     validation: [Validators.required, BIValidators.maskNotEmpty],
                            //     label: 'From Value'
                            // }, {
                            //     name: 'valueSecond',
                            //     type: 'inputMask',
                            //     mask: '999999999999',
                            //     value: '2',
                            //     validation: [Validators.required, BIValidators.maskNotEmpty],
                            //     label: 'To Value'
                        }]
                    ]
                }
                // }, {
                //     association: '$or',
                //     group: {
                //         association: '$and',
                //         filters: [
                //             [{
                //                 name: 'name',
                //                 type: 'select',
                //                 value: 'direct_subscribers.Int64',
                //                 validation: [Validators.required],
                //                 label: 'Field',
                //                 placeholder: 'Select field',
                //                 options: this.fieldList.getAsOption()
                //             }, {
                //                 name: 'condition',
                //                 type: 'select',
                //                 value: 'interval',
                //                 validation: [Validators.required],
                //                 label: 'Condition',
                //                 placeholder: 'Select Condition',
                //                 options: this.conditionService.conditions('direct_subscribers.Int64')
                //             }, {
                //                 name: 'valueFirst',
                //                 type: 'inputMask',
                //                 mask: '999999999999',
                //                 value: '0',
                //                 validation: [Validators.required, BIValidators.maskNotEmpty],
                //                 label: 'From Value'
                //             }, {
                //                 name: 'valueSecond',
                //                 type: 'inputMask',
                //                 mask: '999999999999',
                //                 value: '3',
                //                 validation: [Validators.required, BIValidators.maskNotEmpty],
                //                 label: 'To Value'
                //             }],
                //             [{
                //                 name: 'name',
                //                 type: 'select',
                //                 value: 'direct_services.Int64',
                //                 validation: [Validators.required],
                //                 label: 'Field',
                //                 placeholder: 'Select field',
                //                 options: this.fieldList.getAsOption()
                //             }, {
                //                 name: 'condition',
                //                 type: 'select',
                //                 value: 'interval',
                //                 validation: [Validators.required],
                //                 label: 'Condition',
                //                 placeholder: 'Select Condition',
                //                 options: this.conditionService.conditions('direct_services.Int64')
                //             }, {
                //                 name: 'valueFirst',
                //                 type: 'inputMask',
                //                 mask: '999999999999',
                //                 value: '0',
                //                 validation: [Validators.required, BIValidators.maskNotEmpty],
                //                 label: 'From Value'
                //             }, {
                //                 name: 'valueSecond',
                //                 type: 'inputMask',
                //                 mask: '999999999999',
                //                 value: '4',
                //                 validation: [Validators.required, BIValidators.maskNotEmpty],
                //                 label: 'To Value'
                //             }]
                //         ]
                //     }
            }
            ]
        };
    }

    submitFilters(value: { [name: string]: any }) {
        console.log(value);
    }

    private filterChangeSub() {
        this.formSubscription = this.filters
            .changes
            .filter(() => this.filters.valid)
            .distinctUntilChanged((previous, current) => {
                return JSON.stringify(previous) === JSON.stringify(current);
            })
            .subscribe((data: FormData) => {
                console.log(`form is valid : ${this.filters.valid}`);
                console.log('SelectorComponent: subscribe - execute filter!');

                this.filterService.formFilters(data.groups, this.config);
            });

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
