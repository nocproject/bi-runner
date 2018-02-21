import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbstractControl } from '@angular/forms/src/model';

import { clone, findIndex, includes, indexOf, isEqual } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Field } from '@app/model';
import { EventType } from '../model/event.interface';
import { FieldConfig, FilterConfig } from '../model/filters-form-config.interface';
import { DatasourceService } from '../../services/datasource-info.service';
import { EventService } from '../../services/event.service';
import { FieldConfigService } from '../services/field-config.service';

@Component({
    selector: 'bi-filter-form',
    templateUrl: './filter.component.html'
})
export class FilterComponent implements OnInit, OnDestroy {
    @Input()
    index: number;
    @Input()
    group: number;
    @Input()
    parent: FormGroup;
    @Input()
    filterConfig: FilterConfig;
    //
    filter: FormGroup;
    fieldSelect: FieldConfig = {
        controlName: 'name',
        type: 'select',
        label: 'Field',
        placeholder: 'SELECT_FIELD',
        disabled: false,
        validation: [Validators.required],
        value: '',
        options: this.datasourceService.fieldsAsOption()
    };
    conditionSelect: FieldConfig;
    valueFieldConfig$: Observable<FieldConfig>;
    valueField: Field;
    //
    private prevData;
    private prevField;
    private valuesSubscription: Subscription;

    constructor(private fb: FormBuilder,
                private eventService: EventService,
                private datasourceService: DatasourceService) {
    }

    ngOnInit() {
        this.filter = (<FormGroup>(<FormArray>this.parent.get('group.filters')).at(this.index));
        this.conditionSelect = this.filterConfig.conditionField;
        this.valueFieldConfig$ = this.filterConfig.valueField$;

        this.prevField = this.filterConfig.field;
        this.valueField = this.filterConfig.field;
        if (this.filterConfig.hasOwnProperty('data') && this.filterConfig.data) {
            this.filter.setValue(this.filterConfig.data, {emitEvent: false});
        }
        this.initControl(this.fieldSelect);
        this.initControl(this.conditionSelect);
        this.prevData = clone(this.filter.value);
        this.valuesSubscription = this.filter.valueChanges.subscribe(data => {
            const changed = FilterComponent.changeDetection(data, this.prevData);
            switch (changed) {
                case 'name': {
                    this.valueFieldConfig$ = this.datasourceService.datasource$
                        .map(datasource => {
                            const field: Field = datasource.getFieldByName(data.name);
                            const valueConfig: FieldConfig = FieldConfigService.fieldValueConfig(data, field);
                            const conditions = FieldConfigService.conditions(field);
                            const types = ['dictionary', 'tree', 'model'];

                            if ((indexOf(types, valueConfig.type) >= 0) ||
                                this.prevField && indexOf(['Dictionary', 'Tree', 'Model'], this.prevField.type) >= 0) {
                                this.filter.patchValue({value: ''}, {emitEvent: false});
                            }
                            this.prevField = field;
                            this.valueField = datasource.getFieldByName(data.name);
                            if (findIndex(conditions, o => o.value === data.condition) < 0) {
                                this.filter.patchValue({condition: ''}, {emitEvent: false});
                            }
                            this.conditionSelect.options = Observable.of(conditions);
                            this.initControl(valueConfig);

                            return valueConfig;
                        });
                    break;
                }
                case 'condition': {
                    if (this.prevField) {
                        const valueConfig = FieldConfigService.fieldValueConfig(data, this.prevField);

                        if (valueConfig) {
                            if (this.prevData && includes(this.prevData.condition, 'empty')) {
                                this.valueFieldConfig$ = Observable.of(valueConfig);
                            }
                            this.initControl(valueConfig);
                        } else { // when type = string and condition = empty | not empty
                            const control = this.filter.get('value');
                            this.valueFieldConfig$ = Observable.of({
                                controlName: '',
                                type: 'none',
                                label: '',
                                placeholder: '',
                                disabled: true,
                                validation: [],
                                value: ''
                            });
                            control.clearValidators();
                            control.updateValueAndValidity({emitEvent: false});
                            this.filter.patchValue({value: ''}, {emitEvent: false});
                        }
                    }
                    break;
                }
                case 'value': {
                    break;
                }
            }
            this.prevData = clone(data);
        });
    }

    ngOnDestroy(): void {
        this.valuesSubscription.unsubscribe();
    }

    onDeleteFilter(): void {
        this.eventService.next({type: EventType.DeleteFilter, group: this.group, filter: this.index});
    }

    private initControl(field: FieldConfig): void {
        const control: AbstractControl = this.filter.get(field.controlName);
        if (field.disabled) {
            control.disable();
        }
        control.setValidators(field.validation);
        control.updateValueAndValidity({onlySelf: false, emitEvent: false});
    }

    private static changeDetection(newData, oldData): string {
        if (!isEqual(newData.name, oldData.name)) {
            return 'name';
        } else if (!isEqual(newData.condition, oldData.condition)) {
            return 'condition';
        } else if (!isEqual(newData.value, oldData.value)) {
            return 'value';
        }
        return 'none';
    }
}
