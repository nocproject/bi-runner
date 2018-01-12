import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldConfig, FilterControl } from '../../model';

@Component({
    selector: 'bi-form-input',
    styleUrls: ['form-input.component.scss'],
    template: `
        <div class="form-group"
             [formGroup]="form">
            <label class="control-label" translate>{{ config.label }}:</label>
            <input class="form-control"
                   #input
                   [placeholder]="config.placeholder"
                   [formControlName]="config.name">
            <div ngxErrors="{{ config.name }}" class="ng-invalid">
                <div ngxError="required" translate>
                    VALIDATOR.REQUIRED
                </div>
                <div *ngIf="form.get(config.name).hasError('invalid')"
                     [translate]="form.get(config.name).errors['msg']">
                </div>
            </div>
        </div>
    `
})
export class FormInputComponent implements FilterControl, AfterViewInit {
    @ViewChild('input')
    input: ElementRef;

    config: FieldConfig;
    form: FormGroup;

    ngAfterViewInit(): void {
        if (this.config.name === 'valueFirst') {
            this.input.nativeElement.focus();
            this.input.nativeElement.setSelectionRange(0, 0);
        }
    }
}
