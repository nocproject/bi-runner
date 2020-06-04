import { Component } from '@angular/core';

import { ValueControl } from '../value-control';

@Component({
    selector: 'bi-form-dictionary',
    template: `
        <div class="form-group" [formGroup]="form">
            <label class="control-label">{{ config.label | translate }}:</label>
            <bi-dropdown [config]="config"
                         [field]="field"
                         [formControlName]="config.controlName"></bi-dropdown>
        </div>
    `
})
export class FormDictionaryComponent  extends ValueControl {
}
