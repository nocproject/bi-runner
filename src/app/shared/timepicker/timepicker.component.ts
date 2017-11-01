import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import * as dateFns from 'date-fns';

@Component({
    selector: 'bi-timepicker',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TimepickerComponent),
        multi: true
    }],
    templateUrl: './timepicker.component.html',
    styleUrls: ['./timepicker.component.scss']
})
export class TimepickerComponent implements ControlValueAccessor {
    @Input()
    readonly: boolean;
    @Input()
    buttonShow = true;
    @Input()
    caretShow = true;
    @Input()
    model: Date = new Date(2000, 1, 1, 0, 0);
    @Input()
    hourStep: number;
    @Input()
    minuteStep: number;
    @Output()
    updated: EventEmitter<Date> = new EventEmitter<Date>();
    @Output()
    setTime: EventEmitter<Date> = new EventEmitter<Date>();

    onChangeCb: (_: any) => void = () => {
    };
    onTouchedCb: () => void = () => {
    };

    constructor() {
    }

    changeMinute(step: number): void {
        this.model = dateFns.addMinutes(this.model, step);
        this.onChangeCb(this.model);
        this.updated.emit(this.model);
    }

    changeHour(step: number): void {
        this.model = dateFns.addHours(this.model, step);
        this.onChangeCb(this.model);
        this.updated.emit(this.model);
    }

    onSetTime(): void {
        this.onChangeCb(this.model);
        this.setTime.emit(this.model);
    }

    onUpdateHours(hour: number): void {
        this.model = dateFns.setHours(this.model, hour);
        this.onChangeCb(this.model);
        this.updated.emit(this.model);
    }

    onUpdateMinutes(minutes: number): void {
        this.model = dateFns.setMinutes(this.model, minutes);
        this.onChangeCb(this.model);
        this.updated.emit(this.model);
    }

    writeValue(data: any): void {
        this.model = new Date(data);
    }

    registerOnChange(fn: any): void {
        this.onChangeCb = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCb = fn;
    }
}
