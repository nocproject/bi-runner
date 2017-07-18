import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';

@Component({
    selector: 'bi-form-dictionary',
    styleUrls: ['./form-dictionary.component.scss'],
    template: `
        <div class="form-group" [formGroup]="form">
            <label class="control-label">{{ config.label }}:</label>
            <div>Dictionary not Implemented
            </div>
        </div>
    `
})
export class FormDictionaryComponent implements Field {
    config: FieldConfig;
    form: FormGroup;
}
