import { Validators } from '@angular/forms';

import { includes, startsWith } from 'lodash';

import { Field, IOption } from '@app/model';
import { FieldConfig } from '../model/filters-form-config.interface';
import { BIValidators } from '../components/validators';

export class FieldConfigService {

    static fieldValueConfig(data, field: Field): FieldConfig {
        const valueFieldConfig: FieldConfig = {
            controlName: 'value',
            type: 'input',
            value: data.value ? data.value : '',
            validation: [Validators.required],
            label: 'Value',
            disabled: false,
            placeholder: ''
        };
        if (!data.name) {
            return valueFieldConfig;
        }
        let widgetType = field.type;

        if (startsWith(field.type, 'dict-')) {
            widgetType = 'Dictionary';
        }
        if (startsWith(field.type, 'tree-')) {
            widgetType = 'Tree';
        }
        if (startsWith(field.type, 'model-')) {
            widgetType = 'Model';
        }
        if (field.type === 'Array(String)') {
            widgetType = 'String';
        }

        switch (widgetType) {
            case 'String': {
                if (includes(data.condition, 'empty')) {
                    return;
                }
                break;
            }
            case 'Dictionary': {
                valueFieldConfig.type = 'dictionary';
                break;
            }
            case 'Tree': {
                valueFieldConfig.type = 'tree';
                valueFieldConfig.value = [];
                break;
            }
            case 'Model': {
                valueFieldConfig.type = 'model';
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
                valueFieldConfig.type = 'input';
                if (includes(data.condition, 'interval')) {
                    valueFieldConfig.placeholder = '9999999999 - 9999999999';
                    valueFieldConfig.validation.push(BIValidators.intRange);
                } else {
                    valueFieldConfig.placeholder = '9999999999';
                    valueFieldConfig.validation.push(BIValidators.int);
                }
                return valueFieldConfig;
            }
            case 'Float32':
            case 'Float64': {
                valueFieldConfig.type = 'input';
                if (includes(data.condition, 'interval')) {
                    valueFieldConfig.placeholder = '9999999999.9999 - 9999999999.9999';
                    valueFieldConfig.validation.push(BIValidators.floatRange);
                } else {
                    valueFieldConfig.placeholder = '9999999999.9999';
                    valueFieldConfig.validation.push(BIValidators.float);
                }
                return valueFieldConfig;
            }
            case 'DateTime': {
                if (data.name === 'exclusion_intervals' && !includes(data.condition, 'periodic')) {
                    valueFieldConfig.type = 'input';
                    valueFieldConfig.placeholder = 'dd.mm.yyyy HH:mm - dd.mm.yyyy HH:mm';
                    valueFieldConfig.validation.push(BIValidators.dateTimeRange);
                    return valueFieldConfig;
                }
                if (includes(data.condition, 'interval')) {
                    if (includes(data.condition, 'periodic')) {
                        valueFieldConfig.type = 'input';
                        valueFieldConfig.placeholder = '29:59 - 29:59';
                        valueFieldConfig.validation.push(BIValidators.hours);
                    } else {
                        valueFieldConfig.type = 'input';
                        valueFieldConfig.placeholder = 'dd.mm.yyyy HH:mm - dd.mm.yyyy HH:mm';
                        valueFieldConfig.validation.push(BIValidators.dateTimeRange);
                    }
                    return valueFieldConfig;
                }
                valueFieldConfig.type = 'input';
                valueFieldConfig.placeholder = 'dd.mm.yyyy HH:mm';
                valueFieldConfig.validation.push(BIValidators.dateTime);
                // valueFieldConfig.type = 'calendar';
                break;
            }
            case 'IPv4': {
                valueFieldConfig.type = 'input';
                if (includes(data.condition, 'interval')) {
                    valueFieldConfig.placeholder = '299.299.299.299 - 299.299.299.299';
                    valueFieldConfig.validation.push(BIValidators.ipV4Range);
                    return valueFieldConfig;
                }
                valueFieldConfig.placeholder = '299.299.299.299';
                valueFieldConfig.validation.push(BIValidators.ipV4);
                break;
            }
            case 'Date': {
                if (includes(data.condition, 'interval')) {
                    valueFieldConfig.placeholder = 'dd.mm.yyyy - dd.mm.yyyy';
                    valueFieldConfig.validation.push(BIValidators.dateRange);
                    return valueFieldConfig;
                }
                valueFieldConfig.type = 'input';
                valueFieldConfig.placeholder = 'dd.mm.yyyy';
                valueFieldConfig.validation.push(BIValidators.date);
                break;
            }
            default: {
                console.error(`'${widgetType}' unknowns widget type!`);
            }
        }

        return valueFieldConfig;
    }

    static conditions(field: Field): IOption[] {
        let conditions: IOption[] = [
            {value: '$eq', text: '=='},
            {value: '$ne', text: '<>'}
        ];

        if (startsWith(field.type, 'dict-')) {
            field.type = 'Dictionary';
        }

        if (startsWith(field.type, 'tree-')) {
            field.type = 'Tree';
        }

        if (startsWith(field.type, 'model-')) {
            field.type = 'Model';
        }

        switch (field.type) {
            case ('Dictionary'): {
                conditions = [
                    {value: 'in', text: '=='},
                    {value: 'not.in', text: '<>'}
                ];
                break;
            }
            case ('Tree'): {
                conditions = [
                    {value: 'in', text: '=='},
                    {value: 'not.in', text: '<>'}
                ];
                break;
            }
            case ('Model'): {
                conditions = [
                    {value: '$selector', text: 'CONDITION.SELECT'}
                ];
                break;
            }
            case 'DateTime': {
                if ('exclusion_intervals' === name) {
                    conditions = [
                        {value: 'interval', text: 'CONDITION.INTERVAL'},
                        {value: 'periodic.interval', text: 'CONDITION.PERIODIC_INTERVAL'}
                    ];
                } else {
                    conditions = conditions.concat([
                        {value: 'interval', text: 'CONDITION.INTERVAL'},
                        {value: 'not.interval', text: 'CONDITION.NOT_IN_INTERVAL'},
                        {value: 'periodic.interval', text: 'CONDITION.PERIODIC_INTERVAL'},
                        {value: 'not.periodic.interval', text: 'CONDITION.NOT_IN_PERIODIC'},
                        {value: '$lt', text: '<'},
                        {value: '$lte', text: '<='},
                        {value: '$gt', text: '>'},
                        {value: '$gte', text: '>='}
                    ]);
                }
                break;
            }
            case 'Date': {
                conditions = conditions.concat([
                    {value: 'interval', text: 'CONDITION.INTERVAL'},
                    {value: 'not.interval', text: 'CONDITION.NOT_IN_INTERVAL'},
                    {value: '$lt', text: '<'},
                    {value: '$lte', text: '<='},
                    {value: '$gt', text: '>'},
                    {value: '$gte', text: '>='}
                ]);
                break;
            }
            case 'IPv4': {
                conditions = conditions.concat([
                    {value: 'interval', text: 'CONDITION.INTERVAL'},
                    {value: 'not.interval', text: 'CONDITION.NOT_IN_INTERVAL'},
                    {value: '$lt', text: '<'},
                    {value: '$gt', text: '>'}
                ]);
                break;
            }
            case 'String': {
                conditions = conditions.concat([
                    {value: 'empty', text: 'CONDITION.EMPTY'},
                    {value: 'not.empty', text: 'CONDITION.NOT_EMPTY'},
                    {value: '$like', text: 'CONDITION.LIKE'}
                ]);
                break;
            }
            case 'Array(String)': {
                conditions = [
                    {value: 'empty', text: 'CONDITION.EMPTY'},
                    {value: 'not.empty', text: 'CONDITION.NOT_EMPTY'},
                    {value: '$hasAny', text: 'CONDITION.LIKE'},
                    {value: 'not.$hasAny', text: 'CONDITION.NOT_LIKE'}
                ];
                break;
            }
            default: {
                conditions = conditions.concat([
                    {value: '$lt', text: '<'},
                    {value: '$lte', text: '<='},
                    {value: '$gt', text: '>'},
                    {value: '$gte', text: '>='}
                ]);
                if (!field.isAgg) {
                    conditions = conditions.concat([
                        {value: 'interval', text: 'CONDITION.INTERVAL'},
                        {value: 'not.interval', text: 'CONDITION.NOT_IN_INTERVAL'}]);
                }
            }
        }
        return conditions;
    }
}
