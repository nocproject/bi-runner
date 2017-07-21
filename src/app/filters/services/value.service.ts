import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

import * as _ from 'lodash';

import { FieldConfig } from '../models/form-config.interface';
import { BIValidators } from '../components/validators';

@Injectable()
export class ValueService {

    fields(nameAndType: string, condition: string, datasource: string): FieldConfig[] {
        const first: FieldConfig = {
            name: 'valueFirst',
            type: 'input',
            pseudo: false,
            value: '',
            validation: [Validators.required],
            label: 'Value'
        };
        const second: FieldConfig = {
            name: 'valueSecond',
            type: 'input',
            pseudo: false,
            value: '',
            validation: [Validators.required],
            label: 'To Value'
        };
        const [name, type] = nameAndType.split('.');
        let widgetType = type;

        if (_.startsWith(type, 'dict-')) {
            widgetType = 'Dictionary';
        }

        // console.log(`${name} ${widgetType} ${condition}`);

        switch (widgetType) {
            case 'String': {
                // console.log('widget String');
                if (_.includes(condition, 'empty')) {
                    return [];
                }
                break;
            }
            case 'Dictionary': {
                // console.log('widget Dictionary');
                first.type = 'dictionary';
                first.dict = type.replace('dict-', '');
                first.expr = name;
                first.datasource = datasource;
                break;
            }
            case 'UInt8':
            case 'UInt16':
            case 'UInt32':
            case 'UInt64':
            case 'Int8':
            case 'Int16':
            case 'Int32':
            case 'Int64': {
                first.type = 'inputMask';
                first.mask = '9999999999';
                first.validation.push(BIValidators.maskNotEmpty);
                break;
            }
            case 'Float32':
            case 'Float64': {
                break;
            }
            case 'DateTime': {
                if (name === 'duration_intervals' && !_.includes(condition, 'periodic')) {
                    first.type = 'inputMask';
                    first.mask = '39.19.2999 29:59-39.19.2999 29:59';
                    // ToDo make dateTimeRange validator, check first less second
                    first.validation.push(BIValidators.dateTimeRange);
                    return [first];
                }
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
