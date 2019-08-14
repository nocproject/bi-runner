import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';
import { of } from 'rxjs/observable/of';

import { cloneDeep } from 'lodash';
import * as d3 from 'd3';

import { environment } from '@env/environment';

import { Field, FieldBuilder, Filter, Group, Range } from '@app/model';
import {
    FieldConfig,
    FilterConfig,
    FilterGroupConfig,
    FiltersConfig,
    FiltersFormConfig
} from './model/filters-form-config.interface';
import { EventType } from './model/event.interface';
import { EventService } from '../services/event.service';
import { BIValidators } from './components/validators';
import { FieldConfigService } from './services/field-config.service';

@Component({
    selector: 'bi-filters-form',
    templateUrl: './filters-form.component.html'
})
export class FiltersFormComponent implements OnInit {
    config: FiltersFormConfig;
    filtersForm: FormGroup;
    isProd = environment.production;
    //
    private eventSubscription: Subscription;

    constructor(private fb: FormBuilder,
                private eventService: EventService) {
    }

    ngOnInit() {
        // init state
        const conditionFieldConfig: FieldConfig = {
            controlName: 'condition',
            type: 'select',
            label: 'Condition',
            placeholder: 'CONDITION.SELECT_CONDITION',
            disabled: false,
            validation: [Validators.required],
            value: '',
            options: undefined
        };
        const valueFieldConfig: FieldConfig = {
            controlName: 'value',
            type: 'input',
            label: 'Value',
            placeholder: '',
            disabled: false,
            validation: [Validators.required],
            value: null
        };
        const emptyFilterConfig: FilterConfig = {
            name: 'name',
            condition: 'condition',
            value: 'value',
            conditionField: conditionFieldConfig,
            valueField$: of(valueFieldConfig)
        };
        const freshGroup: FilterGroupConfig = {
            association: '$and',
            active: false,
            group: {
                association: '$and',
                filters: [cloneDeep(emptyFilterConfig)]
            }
        };
        this.config = {
            groups: [{
                association: '$and',
                active: false,
                group: {
                    association: '$and',
                    filters: [
                        {
                            name: 'name',
                            condition: 'condition',
                            value: 'value',
                            conditionField: conditionFieldConfig,
                            valueField$: of(valueFieldConfig)
                            // },
                            // {
                            //     name: 'name',
                            //     condition: 'condition',
                            //     value: 'value',
                            //     conditionField: conditionFieldConfig,
                            //     valueField$: Observable.of(valueFieldConfig)
                        }
                    ]
                }
                // },
                // {
                //     association: '$and',
                //     active: false,
                //     group: {
                //         association: '$and',
                //         filters: [
                //             {
                //                 name: 'name',
                //                 condition: 'condition',
                //                 value: 'value'
                //             }
                //         ]
                //     }
            }]
        };
        this.filtersForm = this.createForm(this.config);
        this.eventSubscription = this.eventService.event$
            .filter(event => event !== null)
            .subscribe(event => {
                switch (event.type) {
                    case EventType.Restore: {
                        const formGroups: Group[] = event.payload.filter(group => group.name === 'form');
                        if (formGroups.length > 0) {
                            // step 1, make config: FiltersFormConfig (transform formGroups: Group[] to this.config: FiltersFormConfig)
                            const groups: FilterGroupConfig[] = formGroups.map((group: Group) => {
                                const filters: FilterConfig[] = group.filters.map((filter: Filter) => {
                                    const filterConfig = cloneDeep(emptyFilterConfig);
                                    const data = this.castToFormData(filter);

                                    filterConfig.conditionField.options = of(FieldConfigService.conditions(filter.field));
                                    filterConfig.valueField$ = of(FieldConfigService.fieldValueConfig(data, filter.field));
                                    filterConfig.field = filter.field;
                                    filterConfig.data = data;

                                    return filterConfig;
                                });
                                const filtersConfig: FiltersConfig = {
                                    association: '$and',
                                    filters: filters
                                };
                                return {
                                    association: group.association,
                                    active: group.active,
                                    group: filtersConfig
                                };
                            });
                            // step 2, create form
                            this.config = {groups: groups};
                            this.filtersForm = this.createForm(this.config);
                        }
                        break;
                    }
                    case EventType.AddBoxplotGroup: {
                        // 1. check exist group with only two filter by key
                        const field: Field = new FieldBuilder().type(event.payload.type).build();
                        const filter: FilterConfig = cloneDeep(emptyFilterConfig);
                        const data = {
                            name: event.payload.key,
                            condition: 'not.interval',
                            value: `${event.payload.quartiles[0]} - ${event.payload.quartiles[2]}`
                        };
                        filter.conditionField.options = of(FieldConfigService.conditions(field));
                        filter.valueField$ = of(FieldConfigService.fieldValueConfig(data, field));
                        filter.field = field;
                        filter.data = data;

                        const boxGroup: FilterGroupConfig = {
                            association: '$and',
                            active: false,
                            group: {
                                association: '$and',
                                filters: [
                                    filter
                                ]
                            }
                        };

                        this.config.groups.push(boxGroup);
                        (<FormArray>this.filtersForm.get('groups')).push(this.createGroup(boxGroup));
                        break;
                    }
                    case EventType.AddGroup: {
                        // Config array
                        this.config.groups.push(freshGroup);
                        // Form controls
                        (<FormArray>this.filtersForm.get('groups')).push(this.createGroup(freshGroup));
                        break;
                    }
                    case EventType.DeleteGroup: {
                        const data = cloneDeep(this.filtersForm.value);
                        // Form controls
                        let filters = (<FormArray>(<FormArray>this.filtersForm.get('groups'))
                            .at(event.group).get('group.filters'));
                        if (filters.length) {
                            (<FormArray>(<FormArray>this.filtersForm.get('groups'))
                                .at(event.group).get('group.filters'))
                                .removeAt(0);
                        }
                        // Config array
                        this.config.groups.splice(event.group, 1);
                        (<FormArray>this.filtersForm.get('groups')).removeAt(event.group);
                        this.filtersForm.patchValue(data, {emitEvent: false});
                        break;
                    }
                    case EventType.AddFilter: {
                        this.config.groups[event.group].group.filters.push(cloneDeep(emptyFilterConfig));
                        // Form control
                        (<FormArray>(<FormArray>this.filtersForm.get('groups'))
                            .at(event.group).get('group.filters'))
                            .push(this.createFilter(cloneDeep(emptyFilterConfig)));
                        break;
                    }
                    case EventType.DeleteFilter: {
                        const data = cloneDeep(this.filtersForm.value);
                        // Config array
                        this.config.groups[event.group].group.filters.splice(event.filter, 1);
                        // Form controls
                        (<FormArray>(<FormArray>this.filtersForm.get('groups'))
                            .at(event.group).get('group.filters'))
                            .removeAt(event.filter);

                        data.groups[event.group].active = false;
                        this.filtersForm.patchValue(data, {emitEvent: false});
                        // if (!this.config.groups[event.group].group.filters.length) {
                        //     const data = cloneDeep(this.filtersForm.value);
                        // this.filterService.formFilters(data.groups, this.config);
                        // }
                        break;
                    }

                }
            });
    }

    onAddGroup(): void {
        this.eventService.next({type: EventType.AddGroup});
    }

    private createForm(config: FiltersFormConfig): FormGroup {
        const groups: FormGroup[] = config.groups.map(g => this.createGroup(g));
        return new FormGroup({
            groups: new FormArray(groups)
        }, BIValidators.form);
    }

    private createGroup(config: FilterGroupConfig): FormGroup {
        const filters = this.fb.array(
            config.group.filters
                .map(filterConfig => this.createFilter(filterConfig))
        );
        const group = this.fb.group({
                association: config.group.association,
                filters: filters
            }
        );
        group.setValidators(BIValidators.group);
        return this.fb.group({
                association: config.association,
                active: config.active,
                group: group
            }
        );
    }

    private createFilter(config: FilterConfig): FormGroup {
        return this.fb.group({
            [config.name]: '',
            [config.condition]: '',
            [config.value]: ''
        });
    }

    private castToFormData(filter: Filter) {
        let value;

        if (filter.getType() === 'Date') {
            if (filter.condition.match(/interval/i)) {
                value = `${d3.time.format('%d.%m.%Y')(filter.values[0].value)} - ${d3.time.format('%d.%m.%Y')(filter.values[1].value)}`;
            } else {
                value = d3.time.format('%d.%m.%Y')(filter.values[0].value);
            }
        } else if (filter.getType() === 'DateTime') {
            if (filter.condition.match(/periodic/i)) {
                value = filter.values[0].value;
            } else if (filter.condition.match(/interval/i)) {
                if (Range.isNotRange(filter.values[0].value)) {
                    value = `${d3.time.format('%d.%m.%Y %H:%M')(filter.values[0].value)} - ${d3.time.format('%d.%m.%Y %H:%M')(filter.values[1].value)}`;
                } else {
                    value = filter.values[0].value;
                }
            } else {
                value = d3.time.format('%d.%m.%Y %H:%M')(filter.values[0].value);
            }
        } else if (filter.condition.match('empty')) {
            // skip empty value
        } else {
            value = filter.values[0].value;
        }
        return {
            name: filter.name,
            condition: filter.condition,
            value: value
        };
    }
}
