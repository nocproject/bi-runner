import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { ValueControl } from '../value-control';

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
                   [formControlName]="config.controlName">
            <div ngxErrors="{{ config.controlName }}" class="ng-invalid">
                <div ngxError="required" translate>
                    VALIDATOR.REQUIRED
                </div>
                <div *ngIf="form.get(config.controlName).hasError('invalid')"
                     [translate]="form.get(config.controlName).errors['msg']">
                </div>
            </div>
        </div>
    `
})
export class FormInputComponent extends ValueControl implements AfterViewInit {
    @ViewChild('input')
    input: ElementRef;

    ngAfterViewInit(): void {
    //     this.input.nativeElement.focus();
    //     this.input.nativeElement.setSelectionRange(0, 0);
    }
}
