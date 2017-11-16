import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import * as _ from 'lodash';
import * as d3 from 'd3';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Rx';

import { EventType, FieldConfig, FiltersConfig, FormConfig, GroupConfig } from '../../models';
import { APIService, FieldListService, FilterService } from '../../../services';
import { ConditionService, EventService, ValueService } from '../../services';
import { BIValidators } from '../../components/validators';
import { Group, Range } from '../../../model';

@Component({
    exportAs: 'filterForm',
    selector: 'bi-filter-form',
    templateUrl: './filter-form.component.html'
})
export class FilterFormComponent implements OnDestroy, OnInit {
    config: FormConfig;

    @Output()
    submit: EventEmitter<any> = new EventEmitter<any>();

    form: FormGroup;
    requestQty$: Observable<number>;
    private eventSubscription: Subscription;
    // private formSubscription: Subscription;

    get changes(): Observable<any> {
        return this.form.valueChanges;
    }

    get valid(): boolean {
        return this.form.valid;
    }

    get value() {
        return this.form.value;
    }

    get hasInactiveGroup(): boolean {
      const filterQty = this.form.value.groups.reduce((acc, i) => i.group.filters.length + acc, 0);
      return this.form.valid && filterQty && this.form.value.groups.filter(group => !group.active).length > 0;
    }

    get hasActiveGroup(): boolean {
      const filterQty = this.form.value.groups.reduce((acc, i) => i.group.filters.length + acc, 0);
      return this.form.valid && filterQty && this.form.value.groups.filter(group => group.active).length > 0;
    }

    constructor(private fb: FormBuilder,
                private api: APIService,
                private eventService: EventService,
                private filterService: FilterService,
                private fieldList: FieldListService,
                private conditionService: ConditionService,
                private valueService: ValueService) {
    }

    ngOnDestroy(): void {
        // ToDo check all subscription, may be use .toPromise()
        this.eventSubscription.unsubscribe();
        // this.formSubscription.unsubscribe();
    }

    ngOnInit() {
        this.createForm();
        this.requestQty$ = this.api.requestQty$;
        this.eventSubscription = this.eventService.event$
            .filter(event => event !== null)
            .subscribe(event => {
                const emptyFilter: FieldConfig[] = [{
                    name: 'name',
                    type: 'select',
                    pseudo: false,
                    label: 'Field',
                    value: '',
                    placeholder: 'SELECT_FIELD',
                    options: this.fieldList.getAsOption(),
                    validation: [Validators.required]
                }];

                switch (event.type) {
                    case EventType.DeleteGroup: {
                        // Config array
                        this.config.groups.splice(event.group, 1);
                        // Form controls
                        (<FormArray>this.form.get('groups')).removeAt(event.group);
                        this.applyData(_.clone(this.form.value));
                        break;
                    }
                    case EventType.AddFilter: {
                        this.config.groups[event.group].group.filters.push(emptyFilter);
                        // Form control
                        (<FormArray>(<FormArray>this.form.get('groups'))
                            .at(event.group).get('group.filters'))
                            .push(this.createFilter(emptyFilter));
                        break;
                    }
                    case EventType.DeleteFilter: {
                        // Config array
                        this.config.groups[event.group].group.filters.splice(event.filter, 1);
                        // Form controls
                        (<FormArray>(<FormArray>this.form.get('groups'))
                            .at(event.group).get('group.filters'))
                            .removeAt(event.filter);

                        const data = _.clone(this.form.value);
                        data.groups[event.group].active = false;
                        this.form.patchValue(data, {emitEvent: false});
                        if (!this.config.groups[event.group].group.filters.length) {
                            const data = _.clone(this.form.value);
                            this.filterService.formFilters(data.groups, this.config);
                        }
                        break;
                    }
                    case EventType.Restore: {
                        const formGroups: Group[] = event.value.filter(group => group.name === 'form');

                        if (formGroups.length > 0) {
                            const formConfig: FormConfig = {groups: []};
                            const qty = (<FormArray>this.form.get('groups')).length;

                            this.config = formConfig;
                            for (let i = 0; i < qty; i++) {
                                (<FormArray>this.form.get('groups')).removeAt(i);
                            }
                            formGroups.forEach((group) => {
                                const filtersConfig: FiltersConfig = {
                                    association: group.filters[0].association,
                                    filters: []
                                };
                                const groupConfig: GroupConfig = {
                                    association: group.association,
                                    active: group.active,
                                    group: filtersConfig
                                };
                                const formControl = this.createGroup(groupConfig);
                                this.config.groups.push(groupConfig);
                                group.filters.forEach(filter => {
                                    if(filter.condition.match('empty')) {
                                      filter.pseudo = false;
                                    }
                                    const nameField: FieldConfig = {
                                        name: 'name',
                                        type: 'select',
                                        pseudo: filter.pseudo,
                                        label: 'Field',
                                        value: `${filter.name}.${filter.type}.${filter.pseudo}`,
                                        placeholder: 'SELECT_FIELD',
                                        options: this.fieldList.getAsOption(),
                                        validation: [Validators.required]
                                    };
                                    const conditionField: FieldConfig = this.conditionService
                                        .field(filter.name, filter.type, filter.pseudo);
                                    const valuesField: FieldConfig[] = this.valueService
                                        .fields(`${filter.name}.${filter.type}`, filter.condition, filter.datasource)
                                        .map(field => field);

                                    conditionField.value = filter.condition;
                                    // remove after implement calendar type
                                    if (filter.type === 'Date') {
                                        if (filter.condition.match(/interval/i)) {
                                            valuesField[0].value = `${d3.time.format('%d.%m.%Y')(filter.values[0].value)}-${d3.time.format('%d.%m.%Y')(filter.values[1].value)}`;
                                        } else {
                                            valuesField[0].value = d3.time.format('%d.%m.%Y')(filter.values[0].value);
                                        }
                                    } else if (filter.type === 'DateTime') {
                                        if (filter.condition.match(/periodic/i)) {
                                            valuesField[0].value = filter.values[0].value;
                                        } else if (filter.condition.match(/interval/i)) {
                                            if(Range.isNotRange(filter.values[0].value)) {
                                                valuesField[0].value = `${d3.time.format('%d.%m.%Y %H:%M')(filter.values[0].value)} - ${d3.time.format('%d.%m.%Y %H:%M')(filter.values[1].value)}`;
                                            } else {
                                                valuesField[0].value =filter.values[0].value;
                                            }
                                        } else {
                                            valuesField[0].value = d3.time.format('%d.%m.%Y %H:%M')(filter.values[0].value);
                                        }
                                    } else if (filter.condition.match('empty')) {
                                        // skip empty value
                                    } else {
                                        valuesField[0].value = filter.values[0].value;
                                    }
                                    if (filter.values[1] && filter.values[1].value && valuesField.length > 1) {
                                        valuesField[1].value = filter.values[1].value;
                                    }

                                    filtersConfig.filters.push([nameField, conditionField].concat(valuesField.map(item => item)));
                                    const filters = this.createFilter([nameField, conditionField].concat(valuesField.map(item => item)));
                                    (<FormArray>formControl.get('group.filters')).push(filters);
                                });
                                (<FormArray>this.form.get('groups')).push(formControl);
                            });
                        }
                        break;
                    }
                    case EventType.ChangeSelect: {
                        switch (event.name) {
                            case 'name': {
                                const filterControls = (<FormGroup>(<FormArray>(<FormArray>this.form.get('groups'))
                                    .at(event.group).get('group.filters')).at(event.filter));

                                // Delete all from config except 'name'
                                this.config.groups[event.group].group.filters[event.filter] =
                                    _.filter(this.config.groups[event.group].group.filters[event.filter], ['name', 'name']);
                                // Delete from controls
                                Object.keys(filterControls.controls)
                                    .filter(name => name !== 'name')
                                    .forEach(name => filterControls.removeControl(name));

                                if (event.value.match('\\.')) {
                                    this.addControlToFilter(event.group, event.filter,
                                        this.conditionService.field(event.value.split('.')[0], event.value.split('.')[1], JSON.parse(event.value.split('.')[2])));
                                }
                                break;
                            }
                            case 'condition': {
                                const filterControls = (<FormGroup>(<FormArray>(<FormArray>this.form.get('groups'))
                                  .at(event.group).get('group.filters')).at(event.filter));
                                const data = _.clone(this.form.value);

                                data.groups[event.group].active = false;
                                this.form.patchValue(data, { emitEvent: false });
                                this.config.groups[event.group].group.filters[event.filter] =
                                  this.config.groups[event.group].group.filters[event.filter]
                                    .filter(field => field.name === 'name' || field.name === 'condition');

                                // set value for catch change field name & condition
                                _.filter(this.config.groups[event.group].group.filters[event.filter], ['name', 'name'])[0].value = filterControls.get('name').value;
                                _.filter(this.config.groups[event.group].group.filters[event.filter], ['name', 'condition'])[0].value = filterControls.get('condition').value;
                                // Delete from controls
                                Object.keys(filterControls.controls)
                                    .filter(name => name !== 'name')
                                    .filter(name => name !== 'condition')
                                    .forEach(name => filterControls.removeControl(name));

                                this.valueService.fields(filterControls.get('name').value, event.value, this.fieldList.datasource)
                                    .forEach(control => {
                                        this.addControlToFilter(event.group, event.filter, control);
                                    });
                                break;
                            }
                        }
                        break;
                    }
                    case EventType.FilterChanged: {
                        const data = _.clone(this.form.value);

                        data.groups[event.group].active = false;
                        data.groups[event.group].group.filters[event.filter] = event.value;
                        this.form.patchValue(data, {emitEvent: false});
                        break;
                    }
                }
            });
    }

    onAddGroup() {
        const fresh: GroupConfig = {
            association: '$and',
            active: false,
            group: {
                association: '$and',
                filters: [
                    [{
                        name: 'name',
                        type: 'select',
                        pseudo: false,
                        label: 'Field',
                        value: '',
                        placeholder: 'SELECT_FIELD',
                        options: this.fieldList.getAsOption(),
                        validation: [Validators.required]
                    }]
                ]
            }
        };
        // ToDo make Class Config & Controls
        // Config array
        this.config.groups.push(fresh);
        // Form controls
        (<FormArray>this.form.get('groups')).push(this.createGroup(fresh));
    }

    onAllButtonClick(active: boolean) {
        const data = _.clone(this.form.value);

        data.groups = data.groups.map(group => {
            group.active = active;
            return group;
        });
      this.applyData(data);
    }

    private applyData(data: any) {
      this.form.patchValue(data, {emitEvent: false});
      this.filterService.formFilters(data.groups, this.config);
    }

    private createForm() {
          // init state
          this.config = {
              groups: [{
                  association: '$and',
                  active: false,
                  group: {
                      association: '$and',
                      filters: [
                          [{
                              name: 'name',
                              type: 'select',
                              value: '',
                              pseudo: false,
                              validation: [Validators.required],
                              label: 'Field',
                              placeholder: 'SELECT_FIELD',
                              options: this.fieldList.getAsOption()
                          }]
                      ]
                  }
              }]
          };

          const groups: FormGroup[] = this.config.groups.map(g => this.createGroup(g));

          this.form = new FormGroup({
              groups: new FormArray(groups)
          }, BIValidators.form);

          // this.formSubscription = this.changes
          //     .filter(() => this.form.valid)
          //     .distinctUntilChanged((previous, current) => {
          //         return JSON.stringify(previous) === JSON.stringify(current);
          //     })
          //     .subscribe((data: FormData) => {
          //         console.log('FilterFormComponent: subscribe - execute filter!');
          //
          //         this.filterService.formFilters(data.groups, this.config);
          //     });
      }

    private createGroup(config: GroupConfig): FormGroup {
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

    private createFilter(config: FieldConfig[]): FormGroup {
        const filter = config.reduce((g, c) => {
            g.addControl(c.name, this.createControl(c));
            return g;
        }, this.fb.group({}));

        filter.setValidators(BIValidators.filter);
        return filter;
    }

    private createControl(config: FieldConfig): FormControl {
        const {disabled, validation, value} = config;
        return this.fb.control({disabled, value}, validation);
    }

    private addControlToFilter(group: number, filter: number, field: FieldConfig) {
        const filterControls = (<FormGroup>(<FormArray>(<FormArray>this.form.get('groups'))
            .at(group).get('group.filters')).at(filter));

        this.config.groups[group].group.filters[filter].push(field);
        // Add control
        filterControls.addControl(field.name, this.createControl(field));
    }
}
