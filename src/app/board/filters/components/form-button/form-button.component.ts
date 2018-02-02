import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldConfig, FilterControl } from '@filter/model';

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
