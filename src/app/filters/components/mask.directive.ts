import { Directive, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import * as _ from 'lodash';

import { maskDigitValidators, neverValidator } from './digit_validators';

const TAB = 9,
    LEFT_ARROW = 37,
    RIGHT_ARROW = 39,
    BACKSPACE = 8,
    DELETE = 46;

const SPECIAL_CHARACTERS = [' ', '/', '(', ')', '+', '-', ':', '.'];

@Directive({
    selector: '[biMask]',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => MaskDirective),
        multi: true
    }]
})
export class MaskDirective implements ControlValueAccessor {
    @Input()
    biMask: string;

    input: HTMLInputElement;
    fullFieldSelected = false;

    private PROMPT = '_';
    private propagateChange: (_: any) => void;

    constructor(private el: ElementRef) {
        this.input = el.nativeElement;
    }

    writeValue(value: string): void {
        this.input.value = value.concat(this.buildPlaceHolder().substr(value.length));
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    // @HostListener('paste', ['$event'])
    // onPaste($event) {
    //     $event.preventDefault();
    // }

    @HostListener('select', ['$event'])
    onSelect($event: UIEvent) {

        this.fullFieldSelected = this.input.selectionStart === 0 &&
            this.input.selectionEnd === this.input.value.length;
    }

    @HostListener('keydown', ['$event', '$event.keyCode'])
    onKeyDown($event: KeyboardEvent, keyCode) {
        if ($event.metaKey || $event.ctrlKey) {
            return;
        }

        if (keyCode !== TAB) {
            $event.preventDefault();
        }

        const key = String.fromCharCode(keyCode),
            cursorPos = this.input.selectionStart;

        switch (keyCode) {
            case LEFT_ARROW:
                this.handleLeftArrow(cursorPos);
                return;
            case RIGHT_ARROW:
                this.handleRightArrow(cursorPos);
                return;
            case BACKSPACE:
                this.handleBackspace(cursorPos);
                return;
            case DELETE:
                this.handleDelete(cursorPos);
                return;
        }
        if (this.fullFieldSelected) {
            this.input.value = this.buildPlaceHolder();
            const firstPlaceholderPos = _.findIndex(this.input.value,
                char => char === this.PROMPT);
            this.input.setSelectionRange(firstPlaceholderPos, firstPlaceholderPos);
        }

        const maskDigit = this.biMask.charAt(cursorPos),
            digitValidator = maskDigitValidators[maskDigit] || neverValidator;

        if (digitValidator(key)) {
            this.overWriteCharAtPosition(cursorPos, key);
            this.handleRightArrow(cursorPos);
        }
    }

    handleBackspace(cursorPos) {
        const previousPos = this.calculatePreviousCursorPos(cursorPos);

        if (previousPos >= 0) {
            this.overWriteCharAtPosition(previousPos, this.PROMPT);
            this.input.setSelectionRange(previousPos, previousPos);
        }
    }

    handleDelete(cursorPos) {
        this.overWriteCharAtPosition(cursorPos, this.PROMPT);
        this.input.setSelectionRange(cursorPos, cursorPos);
    }

    handleLeftArrow(cursorPos) {
        const previousPos = this.calculatePreviousCursorPos(cursorPos);

        if (previousPos >= 0) {
            this.input.setSelectionRange(previousPos, previousPos);
        }
    }

    calculatePreviousCursorPos(cursorPos) {
        const valueBeforeCursor = this.input.value.slice(0, cursorPos);

        return _.findLastIndex(valueBeforeCursor,
            char => !_.includes(SPECIAL_CHARACTERS, char));

    }

    handleRightArrow(cursorPos) {
        const valueAfterCursor = this.input.value.slice(cursorPos + 1);
        const nextPos =
            _.findIndex(valueAfterCursor, char => !_.includes(SPECIAL_CHARACTERS, char));

        if (nextPos >= 0) {
            const newCursorPos = cursorPos + nextPos + 1;

            this.input.setSelectionRange(newCursorPos, newCursorPos);
        }
    }

    buildPlaceHolder(): string {
        if (this.biMask) {
            const chars = this.biMask.split('');

            return chars.reduce((result, char) =>
                    result.concat(_.includes(SPECIAL_CHARACTERS, char) ? char : this.PROMPT),
                '');
        } else {
            return '';
        }
    }

    overWriteCharAtPosition(position: number, key: string): void {
        const currentValue = this.input.value;

        this.input.value = currentValue.slice(0, position) + key + currentValue.slice(position + 1);
        // this.propagateChange(this.input.value.replace(new RegExp(this.PROMPT, 'g'), ''));
        this.propagateChange(this.input.value);
    }
}
