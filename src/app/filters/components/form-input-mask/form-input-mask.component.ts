import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';

@Component({
    selector: 'bi-form-input-mask',
    styleUrls: ['form-input-mask.component.scss'],
    template: `
        <div class="form-group"
             [formGroup]="form">
            <label class="control-label">{{ config.label }}:</label>
            <input class="form-control"
                   biMask="{{ config.mask }}"
                   [formControlName]="config.name">
        </div>
    `
})
export class FormInputMaskComponent implements Field {
    config: FieldConfig;
    form: FormGroup;
}
