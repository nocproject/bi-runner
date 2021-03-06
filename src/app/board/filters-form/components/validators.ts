import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

import { includes, isEmpty, isInteger, isNaN, toNumber } from 'lodash';
import moment from 'moment';
import { Moment } from 'moment/moment';

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
                    invalid: true,
                    msg: 'VALIDATOR.CONDITION_NOT_FOUND'
                };
            }

            if (fields.length > 2) {
                return null;
            }

            if (fields.length === 2
                && filter.controls.hasOwnProperty('condition')
                && includes(filter.get('condition').value, 'empty')) {
                return null;
            }

            return {
                invalid: true,
                msg: 'VALIDATOR.NOT_ALL_FIELDS'
            };
        }
    }

    public static model(filter: FormGroup): ValidationErrors | null {
        const val = filter.value.value;

        if (val && val.length === 3 && !isEmpty(val[2])) {
            return null;
        }
        return {
            invalid: true,
            msg: 'VALIDATOR.NOT_ALL_FIELDS'
        };
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
        const tokens = control.value.split(' - ');

        errors = checkRangeQty(tokens);
        if (errors) return errors;

        const [start, end] = control.value.split(' - ');
        if (isIPv4BI(start) || isIPv4BI(end)) {
            return {
                invalid: true,
                msg: 'VALIDATOR.START_END_NOT_IP'
            };
        }

        if (IPtoNumber(start) >= IPtoNumber(end)) {
            return {
                invalid: true,
                msg: 'VALIDATOR.IP_BAD_RANGE'
            };
        }
    }

    public static hours(control: AbstractControl): ValidationErrors | null {
        if (!control.value) {
            return null;
        }

        let errors;

        errors = checkRangeQty(control.value.split(' - '));
        if (errors) return errors;

        const [first, second] = control.value.split(' - ');
        if (isRightMinutes(first) || isRightMinutes(second)) {
            return {
                invalid: true,
                msg: 'VALIDATOR.BAD_MINUTES'
            };
        }

        const start = toMinutes(first);
        const end = toMinutes(second);

        if (isNaN(start) || isNaN(end)) {
            return {
                invalid: true,
                msg: 'VALIDATOR.PERIODIC_NOT_NUMBER'
            };
        }

        if (start > 1440 || end > 1440) {
            return {
                invalid: true,
                msg: 'VALIDATOR.PERIODIC_EXCEED'
            };
        }

        if (start >= end) {
            return {
                invalid: true,
                msg: 'VALIDATOR.PERIODIC_BAD_RANGE'
            };
        }

        return null;
    }

    public static int(control: AbstractControl): ValidationErrors | null {
        if (!isInteger(Number(control.value))) {
            return {
                invalid: true,
                msg: 'VALIDATOR.MUST_BE_INT'
            };
        }

        return null;
    }

    public static float(control: AbstractControl): ValidationErrors | null {
        if (isNaN(Number(control.value))) {
            return {
                invalid: true,
                msg: 'VALIDATOR.MUST_BE_FLOAT'
            };
        }

        return null;
    }

    public static floatRange(control: AbstractControl): ValidationErrors | null {
        if (!control.value) return null;

        if (!control.value.match('-')) {
            return {
                invalid: true,
                msg: 'VALIDATOR.FLOAT_BAD_FORMAT'
            };
        }
        let errors;
        const tokens = control.value.split(' - ');

        errors = checkRangeQty(tokens);
        if (errors) return errors;

        if (isNaN(Number(tokens[0]))) {
            return {
                invalid: true,
                msg: 'VALIDATOR.FLOAT_BAD_FIRST'
            };
        }

        if (isNaN(Number(tokens[1]))) {
            return {
                invalid: true,
                msg: 'VALIDATOR.'
            };
        }

        if (Number(tokens[0]) >= Number(tokens[1]))
            return {
                invalid: true,
                msg: 'VALIDATOR.FLOAT_BAD_RANGE'
            };
        return null;
    }

    public static intRange(control: AbstractControl): ValidationErrors | null {
        if (!control.value) return null;

        if (!control.value.match('-')) {
            return {
                invalid: true,
                msg: 'VALIDATOR.INT_BAD_FORMAT'
            };
        }
        let errors;
        const tokens = control.value.split(' - ');

        errors = checkRangeQty(tokens);
        if (errors) return errors;

        if (!isInteger(Number(tokens[0]))) {
            return {
                invalid: true,
                msg: 'VALIDATOR.INT_BAD_FIRST'
            };
        }

        if (!isInteger(Number(tokens[1]))) {
            return {
                invalid: true,
                msg: 'VALIDATOR.INT_BAD_SECOND'
            };
        }

        if (Number(tokens[0]) >= Number(tokens[1]))
            return {
                invalid: true,
                msg: 'VALIDATOR.INT_BAD_RANGE'
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

    return toNumber(minutes) > 59;
}

function toMinutes(token: string): number {
    const [hour, min] = token.split(':');
    return toNumber(hour) * 60 + toNumber(min);
}

function isIPv4BI(value: string): ValidationErrors | null {
    const tokens = value.split('.');
    if (tokens.length !== 4 || !tokens[3].length) {
        return {
            invalid: true,
            msg: 'VALIDATOR.NOT_IP'
        };
    }

    if (tokens.filter((item) => !Number.isInteger(toNumber(item))).length > 0) {
        return {
            invalid: true,
            msg: 'VALIDATOR.NOT_IP'
        };
    }

    if (tokens.filter((item) => toNumber(item) > 255).length > 0) {
        return {
            invalid: true,
            msg: 'VALIDATOR.IP_BIG'
        };
    }

    return null;
}

function IPtoNumber(text: string): number {
    const octets = text.split('.');

    return toNumber(octets[3])
        + (toNumber(octets[2]) << 8)
        + (toNumber(octets[1]) << 16)
        + (toNumber(octets[0]) << 24) >>> 0;
}

function checkRangeQty(tokens) {
    if ((tokens.length !== 2 || tokens[0].length === 0 || tokens[1].length === 0)) {
        return {
            invalid: true,
            msg: 'VALIDATOR.MUST_TWO_VALUES'
        };
    }
    return null;
}

function isDate(input, format, prefix: string = '') {
    if (!input) return null;
    let suffix = '';

    if (includes(format, 'HH:mm')) {
        suffix = 'TIME';
    }

    const value: Moment = moment(input, format, true);
    if (!value.isValid()) {
        return {
            invalid: true,
            msg: `VALIDATOR.${prefix}IS_NOT_DATE${suffix}`
        };
    } else if (value.year() < 2000) {
        return {
            invalid: true,
            msg: 'VALIDATOR.YEAR_LESS_2000'
        };
    }
}

function checkDateRange(tokens: string[], format: string) {
    const start: Moment = moment(tokens[0], format, true);
    const end: Moment = moment(tokens[1], format, true);

    if (start.isAfter(end)) {
        return {
            invalid: true,
            msg: 'VALIDATOR.SECOND_LESS_FIRST'
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
            msg: 'VALIDATOR.BAD_FORMAT'
        };
    }

    const tokens = control.value.split(' - ');
    errors = checkRangeQty(tokens);
    if (errors) return errors;

    errors = isDate(tokens[0], format, 'FIRST_');
    if (errors) return errors;
    errors = isDate(tokens[1], format, 'SECOND_');
    if (errors) return errors;
    errors = checkDateRange(tokens, format);
    if (errors) return errors;

    return null;
}
