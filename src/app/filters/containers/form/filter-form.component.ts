import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import * as _ from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';

import { FormConfig, GroupConfig } from '../../models/form-config.interface';
import { FieldListService } from '../../../services/field-list.service';
import { FieldConfig } from '../../models/form-config.interface';
import { EventService } from '../../services/event.service';
import { EventType } from '../../models/event.interface';

import { ConditionService } from '../../services/condition.service';
import { ValueService } from '../../services/value.service';
import { Observable } from 'rxjs/Observable';
import { BIValidators } from '../../components/validators';

@Component({
    exportAs: 'filterForm',
    selector: 'bi-filter-form',
    styleUrls: ['./filter-form.component.scss'],
    templateUrl: './filter-form.component.html'
})
export class FilterFormComponent implements OnChanges, OnDestroy, OnInit {
    @Input()
    config: FormConfig;

    @Output()
    submit: EventEmitter<any> = new EventEmitter<any>();

    form: FormGroup;
    private eventSubscription: Subscription;

    get controls() {
        return this.config.groups;
    }

    get changes(): Observable<any> {
        return this.form.valueChanges;
    }

    get valid(): boolean {
        return this.form.valid;
    }

    get value() {
        return this.form.value;
    }

    constructor(private fb: FormBuilder,
                private eventService: EventService,
                private fieldList: FieldListService,
                private conditionService: ConditionService,
                private valueService: ValueService) {
    }

    ngOnChanges(): void {
        if (this.form) {
            const controls = Object.keys(this.form.controls);
            console.log('FilterFormComponent: ngOnChanges');
            // const configControls = this.controls.map((item) => item.name);
            //
            // controls
            //     .filter((control) => !configControls.includes(control))
            //     .forEach((control) => this.form.removeControl(control));
            //
            // configControls
            //     .filter((control) => !controls.includes(control))
            //     .forEach((name) => {
            //         const config = this.config.find((control) => control.name === name);
            //         this.form.addControl(name, this.createControl(config));
            //     });
        }
    }

    ngOnDestroy(): void {
        // ToDo check all subscription!!!
        this.eventSubscription.unsubscribe();
    }

    ngOnInit() {
        const groups: FormGroup[] = this.config.groups.map(g => this.createGroup(g));

        this.form = new FormGroup({
            groups: new FormArray(groups)
        }, BIValidators.form);

        this.eventSubscription = this.eventService.event$
            .filter(event => event !== null)
            .subscribe(event => {
                const emptyFilter: FieldConfig[] = [{
                    name: 'name',
                    type: 'select',
                    label: 'Field',
                    value: '',
                    placeholder: 'Select field',
                    options: this.fieldList.getAsOption(),
                    validation: [Validators.required]
                }];

                switch (event.type) {
                    case EventType.DeleteGroup: {
                        // Config array
                        this.config.groups.splice(event.group, 1);
                        // Form controls
                        (<FormArray>this.form.get('groups')).removeAt(event.group);
                        break;
                    }
                    case EventType.AddFilter: {
                        // Config array
                        // const emptyFilter = _.cloneDeep(emptyFilter);
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

                                this.addControlToFilter(event.group, event.filter,
                                    this.conditionService.field(event.value.split('.')[1]));
                                break;
                            }
                            case 'condition': {
                                const filterControls = (<FormGroup>(<FormArray>(<FormArray>this.form.get('groups'))
                                    .at(event.group).get('group.filters')).at(event.filter));

                                this.config.groups[event.group].group.filters[event.filter] =
                                    this.config.groups[event.group].group.filters[event.filter]
                                        .filter(field => field.name === 'name' || field.name === 'condition');

                                // set value for catch change field name
                                _.filter(this.config.groups[event.group].group.filters[event.filter], ['name', 'name'])[0].value = filterControls.get('name').value;
                                // Delete from controls
                                Object.keys(filterControls.controls)
                                    .filter(name => name !== 'name')
                                    .filter(name => name !== 'condition')
                                    .forEach(name => filterControls.removeControl(name));

                                this.valueService.fields(filterControls.get('name').value, event.value)
                                    .forEach(control => {
                                        this.addControlToFilter(event.group, event.filter, control);
                                    });
                                break;
                            }
                        }
                    }
                }
            });
    }

    handleSubmit(event: Event) {
        console.log('FilterFormComponent: submit');
        event.preventDefault();
        event.stopPropagation();
        this.submit.emit(this.value);
    }

    onAddGroup() {
        const fresh: GroupConfig = {
            association: '$and',
            group: {
                association: '$and',
                filters: [
                    [{
                        name: 'name',
                        type: 'select',
                        label: 'Field',
                        value: '',
                        placeholder: 'Select field',
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
