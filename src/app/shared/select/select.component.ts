import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { IOption } from '../../model';

@Component({
    selector: 'bi-select',
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true}
    ],
    template: `
        <div class="form-group">
            <label class="control-label">{{ label }}</label>
            <select class="form-control"
                    [(value)]="value"
                    required>
                <option value="">{{ placeholder }}</option>
                <option *ngFor="let option of options"
                        [value]="option.value">{{ option.text }}
                </option>
            </select>
        </div>
    `
})
export class SelectComponent implements ControlValueAccessor, OnChanges {
    private _value = '';
    @Input()
    public options: IOption;
    @Input()
    public label: string;
    @Input()
    public placeholder: string;

    private propagateChange: (_: any) => void;

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.propagateChange(value);
    }

    writeValue(value: any): void {
        console.log(`writeValue: ${value}`);
        if (value) {
            this._value = value;
        }
    }

    registerOnChange(fn: any): void {
        console.log('registerOnChange');
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('ngOnChanges');
        this.propagateChange(this.value);
    }
}
