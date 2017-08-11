import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FilterControl } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';

@Component({
    selector: 'bi-form-tree',
    template: `
        <div class="form-group" [formGroup]="form">
            <label class="control-label" translate>{{ config.label }}:</label>
            <bi-form-dropdown [config]="config"
                              [formControlName]="config.name"></bi-form-dropdown>
        </div>
    `
})
export class FormTreeComponent implements FilterControl {
    config: FieldConfig;
    form: FormGroup;
}
