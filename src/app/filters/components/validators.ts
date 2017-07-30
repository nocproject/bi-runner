import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

import * as _ from 'lodash';
import * as moment from 'moment';
import { Moment } from 'moment';

export class BIValidators {
    public static form(form: FormGroup): ValidationErrors | null {
        // console.log('form validation');
        return null;
    }

    public static group(group: FormGroup): ValidationErrors | null {
        // console.log(`group validation values : ${JSON.stringify(group.value)}`);
        return null;
    }

    public static filter(filter: FormGroup): ValidationErrors | null {
        if (filter) {
            const fields = Object.keys(filter.controls);

            if (!filter.controls.hasOwnProperty('condition')) {
                return {
                    valid: false,
                    msg: 'condition not found'
                };
            }

            if (fields.length > 2) {
                return null;
            }

            if (fields.length === 2
                && filter.controls.hasOwnProperty('condition')
                && _.includes(filter.get('condition').value, 'empty')) {
                return null;
            }

            return {
                valid: false,
                msg: 'not all fields'
            };
        }
    }

    public static ipV4(control: AbstractControl): ValidationErrors | null {
        if (!control.value) {
            return null;
        }

        return isIPv4BI(control.value);
    }

    public static ipV4Range(control: AbstractControl): ValidationErrors | null {
        if (!control.value) {
            return null;
        }

        let errors;
        const tokens = control.value.split('-');

        errors = checkRangeQty(tokens);
        if (errors) return errors;

        const [start, end] = control.value.split('-');
        if (isIPv4BI(start) || isIPv4BI(end)) {
            return {
                invalid: true,
                msg: 'start or end is not IPv4 address'
            };
        }

        if (IPtoNumber(start) >= IPtoNumber(end)) {
            return {
                invalid: true,
                msg: 'the start of the range is bigger than end'
            };
        }
    }

    public static hours(control: AbstractControl): ValidationErrors | null {
        if (!control.value) {
            return null;
        }

        let errors;
        const tokens = control.value.split('-');

        errors = checkRangeQty(tokens);
        if (errors) return errors;

        const [first, second] = control.value.split('-');
        if (isRightMinutes(first) || isRightMinutes(second)) {
            return {
                invalid: true,
                msg: 'minutes should be in the range from 0 to 59'
            };
        }

        const start = toMinutes(first);
        const end = toMinutes(second);
        if (start > 1440 || end > 1440) {
            return {
                invalid: true,
                msg: 'one or both of the values exceed 23:59'
            };
        }

        if (start >= end) {
            return {
                invalid: true,
                msg: 'the start of the range is bigger than end'
            };
        }

        return null;
    }

    public static int(control: AbstractControl): ValidationErrors | null {
        if (!_.isInteger(Number(control.value))) {
            return {
                invalid: true,
                msg: 'value must be int'
            };
        }

        return null;
    }

    public static float(control: AbstractControl): ValidationErrors | null {
        if (_.isNaN(Number(control.value))) {
            return {
                invalid: true,
                msg: 'value must be float'
            };
        }

        return null;
    }

    public static floatRange(control: AbstractControl): ValidationErrors | null {
        if (!control.value) return null;

        if (!control.value.match('-')) {
            return {
                invalid: true,
                msg: 'bad format, use 9999999999.9999-9999999999.9999'
            };
        }
        let errors;
        const tokens = control.value.split('-');

        errors = checkRangeQty(tokens);
        if (errors) return errors;

        if (_.isNaN(Number(tokens[0]))) {
            return {
                invalid: true,
                msg: 'first value isn\'t number'
            };
        }

        if (_.isNaN(Number(tokens[1]))) {
            return {
                invalid: true,
                msg: 'second value isn\'t number'
            };
        }

        if (Number(tokens[0]) >= Number(tokens[1]))
            return {
                invalid: true,
                msg: 'second value less first'
            };
        return null;
    }

    public static intRange(control: AbstractControl): ValidationErrors | null {
        if (!control.value) return null;

        if (!control.value.match('-')) {
            return {
                invalid: true,
                msg: 'bad format, use 9999999999-9999999999'
            };
        }
        let errors;
        const tokens = control.value.split('-');

        errors = checkRangeQty(tokens);
        if (errors) return errors;

        if (!_.isInteger(Number(tokens[0]))) {
            return {
                invalid: true,
                msg: 'first value isn\'t int'
            };
        }

        if (!_.isInteger(Number(tokens[1]))) {
            return {
                invalid: true,
                msg: 'second value isn\'t int'
            };
        }

        if (Number(tokens[0]) >= Number(tokens[1]))
            return {
                invalid: true,
                msg: 'second value less first'
            };
        return null;
    }

    public static dateTimeRange(control: AbstractControl): ValidationErrors | null {
        return _dateRange(control, 'DD.MM.YYYY HH:mm');
    }

    public static dateTime(control: AbstractControl): ValidationErrors | null {
        return isDate(control.value, 'DD.MM.YYYY HH:mm');
    }

    public static dateRange(control: AbstractControl): ValidationErrors | null {
        return _dateRange(control, 'DD.MM.YYYY');
    }

    public static date(control: AbstractControl): ValidationErrors | null {
        return isDate(control.value, 'DD.MM.YYYY');
    }
}

function isRightMinutes(token: string): boolean {
    const minutes = token.split(':')[1];

    return _.toNumber(minutes) > 59;
}

function toMinutes(token: string): number {
    const [hour, min] = token.split(':');
    return _.toNumber(hour) * 60 + _.toNumber(min);
}

function isIPv4BI(value: string): ValidationErrors | null {
    const tokens = value.split('.');
    if (tokens.length !== 4) {
        return {
            invalid: true,
            msg: 'is not ip address'
        };
    }

    if (tokens.filter((item) => _.toNumber(item) > 254).length > 0) {
        return {
            invalid: true,
            msg: 'value bigger 254'
        };
    }

    if (_.toNumber(tokens[0]) === 0 || _.toNumber(tokens[3]) === 0) {
        return {
            invalid: true,
            msg: 'start or end to 0'
        };
    }

    return null;
}

function IPtoNumber(text: string): number {
    const octets = text.split('.');

    return _.toNumber(octets[3])
        + (_.toNumber(octets[2]) << 8)
        + (_.toNumber(octets[1]) << 16)
        + (_.toNumber(octets[0]) << 24) >>> 0;
}

function checkRangeQty(tokens) {
    if ((tokens.length !== 2 || tokens[0].length === 0 || tokens[1].length === 0)) {
        return {
            invalid: true,
            msg: 'must be two value'
        };
    }
    return null;
}

function isDate(input, format, prefix: string = '') {
    if (!input) return null;

    const value: Moment = moment(input, format, true);
    if (!value.isValid()) {
        return {
            invalid: true,
            msg: `${prefix}is not date`
        };
    } else if (value.year() < 2000) {
        return {
            invalid: true,
            msg: 'year < 2000'
        };
    }
}

function checkDateRange(tokens: string[], format: string) {
    const start: Moment = moment(tokens[0], format, true);
    const end: Moment = moment(tokens[1], format, true);

    console.log(start.isAfter(end));
    if (start.isAfter(end)) {
        return {
            invalid: true,
            msg: 'second value less first'
        };
    }
    return null;
}

function _dateRange(control: AbstractControl, format: string): ValidationErrors | null {
    let errors;

    if (!control.value) return null;

    if (!control.value.match('-')) {
        return {
            invalid: true,
            msg: 'bad format'
        };
    }

    const tokens = control.value.split('-');
    errors = checkRangeQty(tokens);
    if (errors) return errors;

    errors = isDate(tokens[0], format, 'first ');
    if (errors) return errors;
    errors = isDate(tokens[1], format, 'second ');
    if (errors) return errors;
    errors = checkDateRange(tokens, format);
    if (errors) return errors;

    return null;
}