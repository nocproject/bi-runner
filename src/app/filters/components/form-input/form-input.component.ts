import { Component, EventEmitter } from '@angular/core';

import { Event } from '../../models/event.interface';
import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';
import { FormGroup } from '@angular/forms';

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
