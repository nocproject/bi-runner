import { Component } from '@angular/core';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'bi-form-select',
    styleUrls: ['form-select.component.scss'],
    template: `
        <div class="form-group"
             [formGroup]="form">
            <label class="control-label">{{ config.label }}:</label>
            <select class="form-control"
                    [formControlName]="config.name">
                <option [ngValue]="''">{{ config.placeholder }}</option>
                <option *ngFor="let item of config.options | async"
                        [ngValue]="item.value">
                    {{ item.text }}
                </option>
            </select>
        </div>
    `
})
export class FormSelectComponent implements Field {
    config: FieldConfig;
    form: FormGroup;
}
