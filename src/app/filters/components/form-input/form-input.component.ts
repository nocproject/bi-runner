import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';

@Component({
    selector: 'bi-form-input',
    styleUrls: ['form-input.component.scss'],
    template: `
        <div class="form-group"
             [formGroup]="form">
            <label class="control-label">{{ config.label }}:</label>
            <input class="form-control"
                   [formControlName]="config.name">
        </div>
    `
})
export class FormInputComponent implements Field {
    config: FieldConfig;
    form: FormGroup;
}
