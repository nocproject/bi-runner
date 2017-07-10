import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

import * as _ from 'lodash';

function isRightMinutes(token: string): boolean {
    const minutes = token.split(':')[1];

    return _.toNumber(minutes) > 59;
}

function toMinutes(token: string): number {
    const [hour, min] = token.split(':');
    return _.toNumber(hour) * 60 + _.toNumber(min);
}

function isIPv4BI(value: string): ValidationErrors | null {
    if (_.includes(value, '_')) {
        return {
            valid: false,
            msg: 'need to completely fill in the field'
        };
    }

    const tokens = value.split('.');
    if (tokens.length !== 4) {
        return {
            valid: false,
            msg: 'is not ip address'
        };
    }

    if (tokens.filter((item) => _.toNumber(item) > 254).length > 0) {
        return {
            valid: false,
            msg: 'value bigger 254'
        };
    }

    if (_.toNumber(tokens[0]) === 0 || _.toNumber(tokens[3]) === 0) {
        return {
            valid: false,
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
            // console.log(`filter validation values : ${JSON.stringify(filter.value)}`);
            const fields = Object.keys(filter.controls);

            // if (filter.controls.hasOwnProperty('name')
            //     && _.startsWith(filter.get('name').value, 'new_')) {
            //     return {
            //         valid: false,
            //         msg: 'select field name'
            //     };
            // }

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

        const [start, end] = control.value.split('-');
        if (isIPv4BI(start) || isIPv4BI(end)) {
            return {
                valid: false,
                msg: 'start or end is not IPv4 address'
            };
        }

        if (IPtoNumber(start) >= IPtoNumber(end)) {
            return {
                valid: false,
                msg: 'the start of the range is bigger than end'
            };
        }

    }

    public static hours(control: AbstractControl): ValidationErrors | null {
        if (!control.value) {
            return null;
        }

        if (_.includes(control.value, '_')) {
            return {
                valid: false,
                msg: 'need to completely fill in the field'
            };
        }

        const [first, second] = control.value.split('-');
        if (isRightMinutes(first) || isRightMinutes(second)) {
            return {
                valid: false,
                msg: 'minutes should be in the range from 0 to 59'
            };
        }

        const start = toMinutes(first);
        const end = toMinutes(second);
        if (start > 1440 || end > 1440) {
            return {
                valid: false,
                msg: 'one or both of the values exceed 23:59'
            };
        }

        if (start >= end) {
            return {
                valid: false,
                msg: 'the start of the range is bigger than end'
            };
        }

        return null;
    }

    public static maskNotEmpty(control: AbstractControl): ValidationErrors | null {
        if (control.value && control.value.replace(new RegExp('_', 'g'), '').length > 0) {
            return null;
        }

        return {
            valid: false,
            msg: 'value must be entered'
        };
    }
}
