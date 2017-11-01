import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { IMyDate, IMyDateModel, IMyDpOptions } from '../my-date-picker/interfaces';

import * as d3 from 'd3';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';

import { BIValidators } from '../../filters/components/validators';
import { Subscription } from 'rxjs/Subscription';
import days = d3.time.days;

@Component({
    selector: 'bi-report-range',
    templateUrl: './report-range.component.html',
    styleUrls: ['./report-range.component.scss']
})
export class ReportRangeComponent implements OnInit, OnDestroy, OnChanges {
    private WEEK_STARTS_ON = 1;
    private data: Data;
    private subscription: Subscription;

    @Input()
    public fromControlName: string;
    @Input()
    public toControlName: string;
    @Input()
    public locale: string;
    @Input()
    public initValues;

    public form: FormGroup;
    public controlValues: IData = {
        fromPick: null,
        toPick: null,
        rangeInput: '-',
        fromTime: null,
        toTime: null
    };
    public myDatePickerOptions: IMyDpOptions = {
        // other options...
        dateFormat: 'dd.mm.yyyy',
        inline: true,
        showTodayBtn: false,
        minYear: 2010,
        maxYear: 2025
    };

    constructor(private fb: FormBuilder) {
    }

    ngOnInit() {
        const controls = _.cloneDeep(this.controlValues);
        controls.rangeInput = ['-', BIValidators.dateTimeRange];
        this.form = this.fb.group(controls);
        this.data = new Data(this.controlValues);
        this.subscription = this.form.valueChanges
            .subscribe(values => {
                this.form.setValue(this.data.next(values, this.form.get('rangeInput')).values(), {
                    emitEvent: false,
                    onlySelf: true
                });
            });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.initValues.currentValue) {
            this.form.setValue(
                this.data.restore(changes.initValues.currentValue, this.fromControlName, this.toControlName).values(), {
                    emitEvent: false,
                    onlySelf: true
                });
        }
    }

    get values() {
        return {
            [this.fromControlName]: this.data.values().fromTime,
            [this.toControlName]: this.data.values().toTime
        };
    }

    get valid(): boolean {
        return this.form.valid;
    }

    public selectRange(range: string): void {
        let dateRange;
        let today = dateFns.startOfDay(new Date());

        if (range === 'tm') {
            dateRange = {
                from: dateFns.startOfMonth(today),
                to: dateFns.endOfMonth(today)
            };
        } else if (range === 'lm') {
            today = dateFns.subMonths(today, 1);
            dateRange = {
                from: dateFns.startOfMonth(today),
                to: dateFns.endOfMonth(today)
            };
        } else if (range === 'lw') {
            today = dateFns.subWeeks(today, 1);
            dateRange = {
                from: dateFns.startOfWeek(today, {weekStartsOn: this.WEEK_STARTS_ON}),
                to: dateFns.endOfWeek(today, {weekStartsOn: this.WEEK_STARTS_ON})
            };
        } else if (range === 'tw') {
            dateRange = {
                from: dateFns.startOfWeek(today, {weekStartsOn: this.WEEK_STARTS_ON}),
                to: dateFns.endOfWeek(today, {weekStartsOn: this.WEEK_STARTS_ON})
            };
        } else if (range === 'ty') {
            dateRange = {
                from: dateFns.startOfYear(today),
                to: dateFns.endOfYear(today)
            };
        } else if (range === 'ly') {
            today = dateFns.subYears(today, 1);
            dateRange = {
                from: dateFns.startOfYear(today),
                to: dateFns.endOfYear(today)
            };
        } else if (range === 'ld') {
            dateRange = {
                from: dateFns.startOfYesterday(),
                to: dateFns.endOfYesterday()
            };
        } else if (range.startsWith('l')) {
            const today = dateFns.startOfDay(new Date());
            const days = +range.replace('l', '');
            dateRange = {
                from: dateFns.subDays(today, days),
                to: dateFns.endOfDay(today)
            };
        }
        this.form.setValue(this.data.set(dateRange).values());
    }
}

class Data {
    private data: IData;
    private prev: IData;

    constructor(data: IData) {
        this.data = data;
        this.prev = _.cloneDeep(data);
    }

    public restore(data, fromControlName, toControlName): Data {
        const fromDate = data[fromControlName];
        const toDate = data[toControlName];
        this.prev = _.cloneDeep(this.data);
        this.data.fromPick = {
            date: Data.toMyDate(fromDate),
            jsdate: null,
            formatted: '',
            epoc: 0
        };
        this.data.toPick = {
            date: Data.toMyDate(toDate),
            jsdate: null,
            formatted: '',
            epoc: 0
        };
        this.data.fromTime = fromDate;
        this.data.toTime = toDate;
        this.data.rangeInput = data.text;
        return this;
    };

    public values() {
        return this.data;
    }

    public next(data: IData, control: AbstractControl): Data {
        const changed = this._diff(data, this.data);
        if (changed.length === 1) {
            this.prev = _.cloneDeep(this.data);
            this.data = _.cloneDeep(data);
            switch (changed[0]) {
                case 'fromPick': {
                    this.data.fromTime = Data.changeDate(this.data.fromPick, this.data.fromTime);
                    this.data.rangeInput = this.textRange();
                    break;
                }
                case 'toPick': {
                    this.data.toTime = Data.changeDate(this.data.toPick, this.data.toTime);
                    this.data.rangeInput = this.textRange();
                    break;
                }
                case 'fromTime': {
                    this.data.fromPick.date = Data.toMyDate(this.data.fromTime);
                    this.data.rangeInput = this.textRange();
                    break;
                }
                case 'toTime': {
                    this.data.toPick.date = Data.toMyDate(this.data.toTime);
                    this.data.rangeInput = this.textRange();
                    break;
                }
                case 'rangeInput': {
                    if (control.value && !BIValidators.dateTimeRange(control)) {
                        const dates = data.rangeInput.split('-').map(d => d3.time.format('%d.%m.%Y %H:%M').parse(d));

                        this.data.fromTime = dates[0];
                        this.data.toTime = dates[1];
                        this.data.fromPick.date = Data.toMyDate(dates[0]);
                        this.data.toPick.date = Data.toMyDate(dates[1]);
                    }
                    break;
                }
            }
        }
        return this;
    }

    public set(values): Data {
        this.prev = _.cloneDeep(this.data);
        this.data.fromTime = values.from;
        this.data.toTime = values.to;
        this.data.fromPick.date = Data.toMyDate(values.from);
        this.data.toPick.date = Data.toMyDate(values.to);
        this.data.rangeInput = this.textRange();
        return this;
    }

    public diff(): string[] {
        return this._diff(this.data, this.prev);
    }

    private _diff(a, b): string[] {
        return _.reduce(a, (result, value, key) => _.isEqual(value, b[key]) ? result : result.concat(key), []);
    }

    private textRange(): string {
        return `${d3.time.format('%d.%m.%Y %H:%M')(this.data.fromTime)}-${d3.time.format('%d.%m.%Y %H:%M')(this.data.toTime)}`;
    }

    private static toMyDate(date: Date): IMyDate {
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        };
    }

    private static changeDate(dp: IMyDateModel, time: Date): Date {
        return new Date(dp.date.year, dp.date.month - 1, dp.date.day, time.getHours(), time.getMinutes());
    }
}

export interface IData {
    fromPick: IMyDateModel,
    toPick: IMyDateModel,
    rangeInput: string,
    fromTime: Date,
    toTime: Date,
}
