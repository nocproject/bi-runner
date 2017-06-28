import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

import * as _ from 'lodash';

import { FieldConfig } from '../models/form-config.interface';
import { BIValidators } from '../components/validators';

@Injectable()
export class ValueService {

    constructor() {
    }

    fields(nameAndType: string, condition: string): FieldConfig[] {
        const first: FieldConfig = {
            name: 'valueFirst',
            type: 'input',
            value: '',
            validation: [Validators.required],
            label: 'Value'
        };
        const second: FieldConfig = {
            name: 'valueSecond',
            type: 'input',
            value: '',
            validation: [Validators.required],
            label: 'To Value'
        };
        const [name, type] = nameAndType.split('.');
        let widgetType = type;

        if (_.startsWith(type, 'dict-')) {
            widgetType = 'Dictionary';
        }

        console.log(`${name} ${widgetType} ${condition}`);

        switch (widgetType) {
            case 'String': {
                console.log('widget String');
                if (_.includes(condition, 'empty')) {
                    return [];
                }
                break;
            }
            case 'Dictionary': {
                console.log('widget Dictionary');
                first.type = 'dictionary';
                break;
            }
            case 'Int16':
            case 'Int32':
            case 'Int64': {
                console.log('widget Int');
                first.type = 'inputMask';
                first.mask = '9999999999';
                first.validation.push(BIValidators.maskNotEmpty);
                break;
            }
            case 'Float64': {
                console.log('widget Float');
                break;
            }
            case 'DateTime': {
                console.log('widget DateTime');
                if (_.includes(condition, 'interval')) {
                    if (_.includes(condition, 'periodic')) {
                        first.type = 'inputMask';
                        first.mask = '29:59-29:59';
                        first.validation.push(BIValidators.hours);
                    } else {
                        first.type = 'dateRange';
                    }
                    return [first];
                }
                first.type = 'calendar';
                break;
            }
            case 'IPv4': {
                console.log('IPv4');
                first.type = 'inputMask';
                first.mask = '299.299.299.299-299.299.299.299';
                if (_.includes(condition, 'interval')) {
                    first.validation.push(BIValidators.ipV4Range);
                    return [first];
                }
                first.mask = '299.299.299.299';
                first.validation.push(BIValidators.ipV4);
                break;
            }
            case 'Date': {
                console.log('widget Date');
                if (_.includes(condition, 'interval')) {
                    first.type = 'dateRange';
                    return [first];
                }
                first.type = 'calendar';
                break;
            }
            default: {
                console.error('unknowns widget type!');
            }
        }

        if (_.includes(condition, 'interval')) {
            console.log('add second field, except: Date(interval), DateTime (interval, periodic)');
            first.label = 'From Value';
            if (type.startsWith('Int')) {
                second.type = 'inputMask';
                second.mask = '9999999999';
                first.validation.push(BIValidators.maskNotEmpty);
            }

            return [first, second];
        }

        return [first];
    }
}