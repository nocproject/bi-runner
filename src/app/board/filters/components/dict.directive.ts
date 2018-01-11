import { Directive, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
    selector: '[biDict]',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DictDirective),
        multi: true
    }]
})
export class DictDirective implements ControlValueAccessor {
    input: HTMLInputElement;
    private propagateChange: (_: any) => void;

    constructor(private el: ElementRef) {
        this.input = el.nativeElement;
    }

    writeValue(value: string): void {
        this.input.value = value;
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }
}
