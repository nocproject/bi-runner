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
        const [name, type] = nameAndType.split('.');
        let widgetType = type;

        if (_.startsWith(type, 'dict-')) {
            widgetType = 'Dictionary';
        }
        if (_.startsWith(type, 'tree-')) {
            widgetType = 'Tree';
        }
        if (_.startsWith(type, 'model-')) {
            widgetType = 'Model';
        }

        // console.log(`${name} ${widgetType} ${condition}`);

        switch (widgetType) {
            case 'String': {
                if (_.includes(condition, 'empty')) {
                    return [];
                }
                break;
            }
            case 'Dictionary': {
                first.type = 'dictionary';
                first.dict = type.replace('dict-', '');
                first.expr = name;
                first.datasource = datasource;
                break;
            }
            case 'Tree': {
                first.type = 'tree';
                first.dict = type.replace('tree-', '');
                first.expr = name;
                first.datasource = datasource;
                break;
            }
            case 'Model': {
                first.type = 'model';
                first.model = type.replace('model-', '').replace('_', '.');
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
                first.type = 'input';
                if (_.includes(condition, 'interval')) {
                    first.placeholder = '9999999999-9999999999';
                    first.validation.push(BIValidators.intRange);
                } else {
                    first.placeholder = '9999999999';
                    first.validation.push(BIValidators.int);
                }
                return [first];
            }
            case 'Float32':
            case 'Float64': {
                first.type = 'input';
                if (_.includes(condition, 'interval')) {
                    first.placeholder = '9999999999.9999-9999999999.9999';
                    first.validation.push(BIValidators.floatRange);
                } else {
                    first.placeholder = '9999999999.9999';
                    first.validation.push(BIValidators.float);
                }
                return [first];
            }
            case 'DateTime': {
                if (name === 'duration_intervals' && !_.includes(condition, 'periodic')) {
                    first.type = 'input';
                    first.placeholder = 'dd.mm.yyyy HH:mm-dd.mm.yyyy HH:mm';
                    first.validation.push(BIValidators.dateTimeRange);
                    return [first];
                }
                if (_.includes(condition, 'interval')) {
                    if (_.includes(condition, 'periodic')) {
                        first.type = 'input';
                        first.placeholder = '29:59-29:59';
                        first.validation.push(BIValidators.hours);
                    } else {
                        first.type = 'input';
                        first.placeholder = 'dd.mm.yyyy HH:mm-dd.mm.yyyy HH:mm';
                        first.validation.push(BIValidators.dateTimeRange);
                    }
                    return [first];
                }
                first.type = 'input';
                first.placeholder = 'dd.mm.yyyy HH:mm';
                first.validation.push(BIValidators.dateTime);
                // first.type = 'calendar';
                break;
            }
            case 'IPv4': {
                first.type = 'input';
                if (_.includes(condition, 'interval')) {
                    first.placeholder = '299.299.299.299-299.299.299.299';
                    first.validation.push(BIValidators.ipV4Range);
                    return [first];
                }
                first.placeholder = '299.299.299.299';
                first.validation.push(BIValidators.ipV4);
                break;
            }
            case 'Date': {
                if (_.includes(condition, 'interval')) {
                    first.placeholder = 'dd.mm.yyyy-dd.mm.yyyy';
                    first.validation.push(BIValidators.dateRange);
                    return [first];
                }
                first.type = 'input';
                first.placeholder = 'dd.mm.yyyy';
                first.validation.push(BIValidators.date);
                break;
            }
            default: {
                console.error('unknowns widget type!');
            }
        }

        return [first];
    }
}
