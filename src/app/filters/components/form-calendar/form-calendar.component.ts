import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldConfig, FilterControl } from '../../models';

@Component({
    selector: 'bi-form-calendar',
    styleUrls: ['./form-calendar.component.scss'],
    template: `
        <div class="form-group" [formGroup]="form">
            <label class="control-label">{{ config.label }}:</label>
            <div>Calendar not Implemented
            </div>
        </div>
    `
})
export class FormCalendarComponent implements FilterControl {
    config: FieldConfig;
    form: FormGroup;
}
