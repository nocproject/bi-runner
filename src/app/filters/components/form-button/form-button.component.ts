import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FilterControl } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';

@Component({
    selector: 'bi-form-button',
    styleUrls: ['form-button.component.scss'],
    template: `
        <div
                class="dynamic-field form-button">
            <button
                    [disabled]="config.disabled"
                    type="submit">
                {{ config.label }}
            </button>
        </div>
    `
})
export class FormButtonComponent implements FilterControl {
    config: FieldConfig;
    form: FormGroup;
}
