import { Component } from '@angular/core';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'bi-form-date-range',
  styleUrls: ['./form-date-range.component.scss'],
    template: `
        <div class="form-group" [formGroup]="form">
            <label class="control-label">{{ config.label }}:</label>
            <div>Date Range not Implemented
            </div>
        </div>
    `
})
export class FormDateRangeComponent implements Field {
    config: FieldConfig;
    form: FormGroup;
}
