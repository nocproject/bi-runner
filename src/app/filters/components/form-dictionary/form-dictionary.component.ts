import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldConfig, FilterControl } from '../../models';

@Component({
    selector: 'bi-form-dictionary',
    template: `
        <div class="form-group" [formGroup]="form">
            <label class="control-label" translate>{{ config.label }}:</label>
            <bi-form-dropdown [config]="config"
                              [useCache]="config.type === 'tree'"
                              [formControlName]="config.name"></bi-form-dropdown>
        </div>
    `
})
export class FormDictionaryComponent implements FilterControl {
    config: FieldConfig;
    form: FormGroup;
}
