import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FilterControl } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';

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
                        [value]="item.value">
                    {{ item.text }}
                </option>
            </select>
        </div>
    `
})
export class FormSelectComponent implements FilterControl {
    config: FieldConfig;
    form: FormGroup;
}
