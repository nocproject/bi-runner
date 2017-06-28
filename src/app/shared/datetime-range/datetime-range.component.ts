import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import * as dateFns from 'date-fns';

export interface IDateRange {
    from: Date;
    to: Date;
}

@Component({
    selector: 'bi-datetime-range',
    templateUrl: './datetime-range.component.html',
    styleUrls: ['./datetime-range.component.scss']
})
export class DatetimeRangeComponent implements OnInit {
    private WEEK_STARTS_ON = 1;
    public opened: false | 'from' | 'to';
    public datePick: IDateRange;
    public range: 'tm' | 'lm' | 'lw' | 'tw' | 'ty' | 'ly';
    public moment: Date;
    public dayNames: string[];
    public dates: Date[];
    public currentDate: Date;

    @Input()
    public fromControlName: string;
    @Input()
    public toControlName: string;
    @Input()
    public form: FormGroup;

    public ngOnInit() {
        this.opened = false;
        this.dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        this.datePick = {
            from: null,
            to: null
        };
        // default period is not set
        // this.moment = new Date();
        // this.generateCalendar();
        this.selectRange('lw');
    }

    public toggleCalendar(selection: false | 'from' | 'to'): void {
        if (this.opened && this.opened !== selection) {
            this.opened = selection;
        } else {
            this.opened = this.opened ? false : selection;
        }
        if (selection && this.datePick[selection]) {
            const diffMonths = dateFns.differenceInCalendarMonths(
                this.datePick[selection], this.moment);

            this.currentDate = this.datePick[selection];
            if (diffMonths !== 0) {
                this.moment = dateFns.addMonths(this.moment, diffMonths);
                this.generateCalendar();
            }
        }
    }

    public selectRange(range: 'tm' | 'lm' | 'lw' | 'tw' | 'ty' | 'ly'): void {
        let today = dateFns.startOfDay(new Date());

        switch (range) {
            case 'tm':
                this.datePick = {
                    from: dateFns.startOfMonth(today),
                    to: dateFns.endOfMonth(today)
                };
                break;
            case 'lm':
                today = dateFns.subMonths(today, 1);
                this.datePick = {
                    from: dateFns.startOfMonth(today),
                    to: dateFns.endOfMonth(today)
                };
                break;
            case 'lw':
                today = dateFns.subWeeks(today, 1);
                this.datePick = {
                    from: dateFns.startOfWeek(today, {weekStartsOn: this.WEEK_STARTS_ON}),
                    to: dateFns.endOfWeek(today, {weekStartsOn: this.WEEK_STARTS_ON})
                };
                break;
            default:
            case 'tw':
                this.datePick = {
                    from: dateFns.startOfWeek(today, {weekStartsOn: this.WEEK_STARTS_ON}),
                    to: dateFns.endOfWeek(today, {weekStartsOn: this.WEEK_STARTS_ON})
                };
                break;
            case 'ty':
                this.datePick = {
                    from: dateFns.startOfYear(today),
                    to: dateFns.endOfYear(today)
                };
                break;
            case 'ly':
                today = dateFns.subYears(today, 1);
                this.datePick = {
                    from: dateFns.startOfYear(today),
                    to: dateFns.endOfYear(today)
                };
                break;
        }

        this.form.patchValue({
            [this.fromControlName]: this.datePick.from,
            [this.toControlName]: this.datePick.to});
        this.range = range;
        this.moment = new Date(this.datePick.from);
        this.currentDate = this.datePick.from;
        this.generateCalendar();
        this.toggleCalendar(false);
    }

    public generateCalendar(): void {
        this.dates = [];
        const firstDate = dateFns.startOfWeek(dateFns.startOfMonth(this.moment), {weekStartsOn: this.WEEK_STARTS_ON});
        const lastDate = dateFns.endOfWeek(dateFns.endOfMonth(this.moment), {weekStartsOn: this.WEEK_STARTS_ON});
        const end = dateFns.differenceInCalendarDays(lastDate, firstDate);

        for (let i = 0; i <= end; i += 1) {
            const day = dateFns.addDays(firstDate, i);
            this.dates.push(day);
        }
    }

    public selectDate(date: Date): void {

        if (this.opened === 'from') {
            this.datePick.from = date;
            this.form.patchValue({[this.fromControlName]: date});
            this.currentDate = date;
            if (this.datePick && this.datePick.to &&
                dateFns.compareDesc(date, this.datePick.to) < 1) {
                this.datePick.to = null;
                this.form.patchValue({[this.toControlName]: null});
            }
        }

        if (this.opened === 'to') {
            this.datePick.to = date;
            this.form.patchValue({[this.toControlName]: date});
            this.currentDate = date;
            if (this.datePick && this.datePick.from &&
                dateFns.compareAsc(date, this.datePick.from) < 1) {
                this.datePick.from = null;
                this.form.patchValue({[this.fromControlName]: null});
            }
        }
    }

    public prevMonth(): void {
        this.moment = dateFns.addMonths(this.moment, -1);
        this.generateCalendar();
    }

    public nextMonth(): void {
        this.moment = dateFns.addMonths(this.moment, 1);
        this.generateCalendar();
    }

    public isWithinRange(day: Date): boolean {
        return this.datePick.from && this.datePick.to
            && dateFns.isWithinRange(day, this.datePick.from, this.datePick.to);
    }

    public isDateRangeFrom(day: Date): boolean {
        return dateFns.isSameDay(day, this.datePick.from);
    }

    public isDateRangeTo(day: Date): boolean {
        return dateFns.isSameDay(day, this.datePick.to);
    }

    public onSetTime(date: Date): void {
        if (this.opened === 'from') {
            this.opened = 'to';
            this.datePick.from = date;
            this.form.patchValue({[this.fromControlName]: date});
            this.currentDate = this.datePick.to;
            return;
        }
        if (this.opened === 'to') {
            this.datePick.to = date;
            this.form.patchValue({[this.toControlName]: date});
            this.toggleCalendar(false);
        }
    }

    public onUpdateTime(date: Date): void {
        if (this.opened === 'from') {
            this.datePick.from = date;
            this.form.patchValue({[this.fromControlName]: date});
            return;
        }
        if (this.opened === 'to') {
            this.datePick.to = date;
            this.form.patchValue({[this.toControlName]: date});
        }
    }
}
