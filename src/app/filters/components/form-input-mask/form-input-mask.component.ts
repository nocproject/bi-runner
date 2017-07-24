import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FilterControl } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';

@Component({
    selector: 'bi-form-input-mask',
    styleUrls: ['form-input-mask.component.scss'],
    template: `
        <div class="form-group"
             [formGroup]="form">
            <label class="control-label">{{ config.label }}:</label>
            <input class="form-control"
                   #input
                   biMask="{{ config.mask }}"
                   [formControlName]="config.name">
        </div>
    `
})
export class FormInputMaskComponent implements FilterControl, AfterViewInit {
    @ViewChild('input')
    input: ElementRef;

    config: FieldConfig;
    form: FormGroup;

    ngAfterViewInit(): void {
        if (this.config.name === 'valueFirst') {
            this.input.nativeElement.focus();
            this.input.nativeElement.setSelectionRange(0,0);
        }
    }
}
