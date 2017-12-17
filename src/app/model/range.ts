import * as dateFns from 'date-fns';

import { Value } from './index';

export class Range {
    public static isNotRange(value: string): boolean {
        return dateFns.isValid(new Date(value));
    }

    public static getValues(range: string): Value[] {
        const dates = this.getDates(range);
        return [new Value(dates.from), new Value(dates.to)];
    }

    public static getDates(range: string, returnRange: boolean = true): IDateRange {
        let WEEK_STARTS_ON = 1;
        let dateRange: IDateRange | string;
        let today = dateFns.startOfDay(new Date());

        if (range === 'tm') {
            if (returnRange) {
                dateRange = {
                    from: dateFns.startOfMonth(today),
                    to: dateFns.endOfMonth(today)
                };
            } else {
                dateRange = {
                    text: 'THIS_MONTH'
                };
            }
        } else if (range === 'lm') {
            if (returnRange) {
                today = dateFns.subMonths(today, 1);
                dateRange = {
                    from: dateFns.startOfMonth(today),
                    to: dateFns.endOfMonth(today)
                };
            } else {
                dateRange = {
                    text: 'LAST_MONTH'
                };
            }
        } else if (range === 'lw') {
            if (returnRange) {
                today = dateFns.subWeeks(today, 1);
                dateRange = {
                    from: dateFns.startOfWeek(today, {weekStartsOn: WEEK_STARTS_ON}),
                    to: dateFns.endOfWeek(today, {weekStartsOn: WEEK_STARTS_ON})
                };
            } else {
                dateRange = {
                    text: 'LAST_WEEK'
                };
            }
        } else if (range === 'tw') {
            if (returnRange) {
                dateRange = {
                    from: dateFns.startOfWeek(today, {weekStartsOn: WEEK_STARTS_ON}),
                    to: dateFns.endOfWeek(today, {weekStartsOn: WEEK_STARTS_ON})
                };
            } else {
                dateRange = {
                    text: 'THIS_WEEK'
                };
            }
        } else if (range === 'ty') {
            if (returnRange) {
                dateRange = {
                    from: dateFns.startOfYear(today),
                    to: dateFns.endOfYear(today)
                };
            } else {
                dateRange = {
                    text: 'THIS_YEAR'
                };
            }
        } else if (range === 'ly') {
            if (returnRange) {
                today = dateFns.subYears(today, 1);
                dateRange = {
                    from: dateFns.startOfYear(today),
                    to: dateFns.endOfYear(today)
                };
            } else {
                dateRange = {
                    text: 'LAST_YEAR'
                };
            }
        } else if (range === 'ld') {
            if (returnRange) {
                dateRange = {
                    from: dateFns.startOfYesterday(),
                    to: dateFns.endOfYesterday()
                };
            } else {
                dateRange = {
                    text: 'YESTERDAY'
                };
            }
        } else if (range === 'lt') {
            if (returnRange) {
                dateRange = {
                    from: dateFns.startOfDay(new Date()),
                    to: dateFns.endOfDay(new Date())
                };
            } else {
                dateRange = {
                    text: 'TODAY'
                };
            }
        } else if (range.startsWith('l')) {
            const today = dateFns.startOfDay(new Date());
            const days = +range.replace('l', '');
            if (returnRange) {
                dateRange = {
                    from: dateFns.subDays(today, days - 1),
                    to: dateFns.endOfDay(today)
                };
            } else {
                if (days)
                    dateRange = {
                        text: `LAST_${days}`
                    };
            }
        }
        return dateRange;
    }
}

export interface IDateRange {
    from?: Date,
    to?: Date,
    text?: string
}