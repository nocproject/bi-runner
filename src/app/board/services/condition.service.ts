import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

import { Observable } from 'rxjs/Rx';
import {startsWith} from 'lodash';

import { Field, IOption } from '@app/model';
import { FieldConfig } from '@filter/model';
import { DatasourceService } from './datasource-info.service';

@Injectable()
export class ConditionService {

    constructor(private filterService: DatasourceService) {
    }

    conditions(name: string): Observable<IOption[]> {
        return this.filterService.datasource$.map(ds => {
            const field = ds.getFieldByName(name);
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
                default: {
                    conditions = conditions.concat([
                        {value: 'interval', text: 'CONDITION.INTERVAL'},
                        {value: 'not.interval', text: 'CONDITION.NOT_IN_INTERVAL'},
                        {value: '$lt', text: '<'},
                        {value: '$lte', text: '<='},
                        {value: '$gt', text: '>'},
                        {value: '$gte', text: '>='}
                    ]);
                }
            }
            return conditions;
        });
    }

    field(name: string): FieldConfig {
        return {
            name: 'condition',
            type: 'select',
            value: '',
            validation: [Validators.required],
            label: 'Condition',
            options: this.conditions(name),
            placeholder: 'CONDITION.SELECT_CONDITION'
        };
    }
}
