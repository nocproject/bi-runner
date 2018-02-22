import { Component } from '@angular/core';

import { ValueControl } from '../value-control';

@Component({
    selector: 'bi-form-select',
    styleUrls: ['form-select.component.scss'],
    template: `
        <div class="form-group"
             [formGroup]="form">
            <label class="control-label" translate>{{ config.label }}:</label>
            <select class="form-control"
                    [formControlName]="config.controlName">
                <option [ngValue]="''" translate>{{ config.placeholder }}</option>
                <option *ngFor="let item of config.options | async"
                        [value]="item.value" translate>
                    {{ item.text }}
                </option>
            </select>
        </div>
    `
})
export class FormSelectComponent extends ValueControl {
}