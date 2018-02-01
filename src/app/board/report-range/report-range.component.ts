import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { IMyDate, IMyDateModel, IMyDpOptions } from '../../shared/my-date-picker/interfaces';

import * as d3 from 'd3';
import * as _ from 'lodash';
import { Subscription } from 'rxjs/Subscription';

import { BIValidators } from '../filters/components/validators';
import { IDateRange, Range } from '@app/model/index';

@Component({
    selector: 'bi-report-range',
    templateUrl: './report-range.component.html',
    styleUrls: ['./report-range.component.scss']
})
export class ReportRangeComponent implements OnInit, OnDestroy, OnChanges {
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
    private data: Data;
    private subscription: Subscription;

    constructor(private fb: FormBuilder) {
    }

    private _range: string;

    get range() {
        return this._range;
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

    ngOnInit() {
        const controls = _.cloneDeep(this.controlValues);
        controls.rangeInput = ['-', BIValidators.dateTimeRange];
        this.form = this.fb.group(controls);
        this.data = new Data(this.controlValues);
        this.subscription = this.form.valueChanges
            .subscribe(values => {
                this._range = null;
                this.form.setValue(this.data.next(values, this.form.get('rangeInput')).values(),
                    {
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
            if (!changes.initValues.currentValue[this.toControlName]) {
                this._range = changes.initValues.currentValue[this.fromControlName];
            }
        }
    }

    public selectRange(range: string): void {
        this._range = range;
        this.form.setValue(this.data.set(Range.getDates(range)).values(),
            {
                emitEvent: false,
                onlySelf: true
            });
    }
}

class Data {
    private data: IData;
    private prev: IData;

    constructor(data: IData) {
        this.data = data;
        this.prev = _.cloneDeep(data);
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

    public restore(data, fromControlName, toControlName): Data {
        let fromDate;
        let toDate;
        if (!data[toControlName]) { // relative range
            const dates: IDateRange = Range.getDates(data[fromControlName]);
            fromDate = dates.from;
            toDate = dates.to;
        } else {
            fromDate = data[fromControlName];
            toDate = data[toControlName];
        }
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
        this.data.rangeInput = this.textRange();
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
                        const dates = data.rangeInput.split(' - ').map(d => d3.time.format('%d.%m.%Y %H:%M').parse(d));

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

    private _diff(a, b): string[] {
        return _.reduce(a, (result, value, key) => _.isEqual(value, b[key]) ? result : result.concat(key), []);
    }

    private textRange(): string {
        return `${d3.time.format('%d.%m.%Y %H:%M')(this.data.fromTime)} - ${d3.time.format('%d.%m.%Y %H:%M')(this.data.toTime)}`;
    }
}

export interface IData {
    fromPick: IMyDateModel,
    toPick: IMyDateModel,
    rangeInput: string,
    fromTime: Date,
    toTime: Date,
}
