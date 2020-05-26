import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMyDate, IMyDateModel, IMyDpOptions } from '../../shared/my-date-picker/interfaces';

import * as d3 from 'd3';
import { cloneDeep, isEqual, reduce } from 'lodash';
import { Subscription } from 'rxjs';

import { BIValidators } from '../filters-form/components/validators';
import { IDateRange, IOption, Range } from '@app/model';

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
    @Input()
    public fields: IOption[];
    @Input()
    public showFields: boolean;
    public form: FormGroup;
    public controlValues: IData = {
        fromPick: null,
        toPick: null,
        rangeInput: '-',
        fromTime: null,
        toTime: null,
        fieldName: 'close_ts',
        range: null
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

    get range() {
        return this.data.values().range;
    }

    get values() {
        return {
            [this.fromControlName]: this.data.values().fromTime,
            [this.toControlName]: this.data.values().toTime,
            fieldName: this.data.values().fieldName
        };
    }

    get valid(): boolean {
        return this.form.valid;
    }

    ngOnInit() {
        const controls: Object = cloneDeep(this.controlValues);

        controls['rangeInput'] = ['-', BIValidators.dateTimeRange];
        controls['fieldName'] = ['close_ts', Validators.required];
        this.form = this.fb.group(controls);
        this.data = new Data(this.controlValues);
        this.subscription = this.form.valueChanges
            .subscribe(values => {
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
        if (changes.initValues && changes.initValues.currentValue) {
            this.form.setValue(
                this.data.restore(changes.initValues.currentValue, this.fromControlName, this.toControlName).values(), {
                    emitEvent: false,
                    onlySelf: true
                });
            if (!changes.initValues.currentValue[this.toControlName]) {
                this.data.values().range = changes.initValues.currentValue[this.fromControlName];
            }
        }
    }

    public selectRange(range: string): void {
        this.data.values().range = range;
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
        this.prev = cloneDeep(data);
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
        this.data.fieldName = data.fieldName;
        this.prev = cloneDeep(this.data);
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
            this.prev = cloneDeep(this.data);
            this.data = cloneDeep(data);
            switch (changed[0]) {
                case 'fromPick': {
                    this.data.fromTime = Data.changeDate(this.data.fromPick, this.data.fromTime);
                    this.data.rangeInput = this.textRange();
                    this.data.range = null;
                    break;
                }
                case 'toPick': {
                    this.data.toTime = Data.changeDate(this.data.toPick, this.data.toTime);
                    this.data.rangeInput = this.textRange();
                    this.data.range = null;
                    break;
                }
                case 'fromTime': {
                    this.data.fromPick.date = Data.toMyDate(this.data.fromTime);
                    this.data.rangeInput = this.textRange();
                    this.data.range = null;
                    break;
                }
                case 'toTime': {
                    this.data.toPick.date = Data.toMyDate(this.data.toTime);
                    this.data.rangeInput = this.textRange();
                    this.data.range = null;
                    break;
                }
                case 'fieldName': {
                    this.data.fieldName = data.fieldName;
                    break;
                }
                case 'rangeInput': {
                    if (control.value && !BIValidators.dateTimeRange(control)) {
                        const dates = data.rangeInput.split(' - ').map(d => d3.timeParse('%d.%m.%Y %H:%M')(d));

                        this.data.fromTime = dates[0];
                        this.data.toTime = dates[1];
                        this.data.fromPick.date = Data.toMyDate(dates[0]);
                        this.data.toPick.date = Data.toMyDate(dates[1]);
                        this.data.range = null;
                    }
                    break;
                }
            }
        }
        return this;
    }

    public set(values): Data {
        this.prev = cloneDeep(this.data);
        this.data.fromTime = values.from;
        this.data.toTime = values.to;
        this.data.fromPick.date = Data.toMyDate(values.from);
        this.data.toPick.date = Data.toMyDate(values.to);
        this.data.rangeInput = this.textRange();
        return this;
    }

    private _diff(a, b): string[] {
        return reduce(a, (result, value, key) => isEqual(value, b[key]) ? result : result.concat(key), []);
    }

    private textRange(): string {
        return `${d3.timeFormat('%d.%m.%Y %H:%M')(this.data.fromTime)} - ${d3.timeFormat('%d.%m.%Y %H:%M')(this.data.toTime)}`;
    }
}

export interface IData {
    fromPick: IMyDateModel,
    toPick: IMyDateModel,
    rangeInput: string,
    fromTime: Date,
    toTime: Date,
    fieldName: string,
    range: string
}
