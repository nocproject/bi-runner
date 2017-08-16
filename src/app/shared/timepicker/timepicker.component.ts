import { Component, EventEmitter, Input, Output } from '@angular/core';

import * as dateFns from 'date-fns';

@Component({
    selector: 'bi-timepicker',
    templateUrl: './timepicker.component.html',
    styleUrls: ['./timepicker.component.scss']
})
export class TimepickerComponent {

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

    constructor() {
    }

    changeMinute(step: number): void {
        this.model = dateFns.addMinutes(this.model, step);
        this.updated.emit(this.model);
    }

    changeHour(step: number): void {
        this.model = dateFns.addHours(this.model, step);
        this.updated.emit(this.model);
    }

    onSetTime(): void {
        this.setTime.emit(this.model);
    }

    onUpdateHours(hour: number): void {
        this.model = dateFns.setHours(this.model, hour);
        this.updated.emit(this.model);
    }

    onUpdateMinutes(minutes: number): void {
        this.model = dateFns.setMinutes(this.model, minutes);
        this.updated.emit(this.model);
    }
}
