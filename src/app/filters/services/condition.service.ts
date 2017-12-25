import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';

import { IOption } from '../../model';
import { FieldConfig } from '../models';

@Injectable()
export class ConditionService {
    conditions(name: string, type: string): Observable<IOption[]> {
        let conditions: IOption[] = [
            {value: '$eq', text: '=='},
            {value: '$ne', text: '<>'}
        ];

        if (_.startsWith(type, 'dict-')) {
            type = 'Dictionary';
        }

        if (_.startsWith(type, 'tree-')) {
            type = 'Tree';
        }

        if (_.startsWith(type, 'model-')) {
            type = 'Model';
        }

        switch (type) {
            case ('Dictionary'): {
                conditions = [
                    {value: 'in', text: '=='},
                    {value: 'not.in', text: '<>'}
                ];
                return Observable.of(conditions);
            }
            case ('Tree'): {
                conditions = [
                    {value: 'in', text: '=='},
                    {value: 'not.in', text: '<>'}
                ];
                return Observable.of(conditions);
            }
            case ('Model'): {
                conditions = [
                    {value: '$selector', text: 'CONDITION.SELECT'}
                ];
                return Observable.of(conditions);
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
                return Observable.of(conditions);
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
                return Observable.of(conditions);
            }
            case 'IPv4': {
                conditions = conditions.concat([
                    {value: 'interval', text: 'CONDITION.INTERVAL'},
                    {value: 'not.interval', text: 'CONDITION.NOT_IN_INTERVAL'},
                    {value: '$lt', text: '<'},
                    {value: '$gt', text: '>'}
                ]);
                return Observable.of(conditions);
            }
            case 'String': {
                conditions = conditions.concat([
                    {value: 'empty', text: 'CONDITION.EMPTY'},
                    {value: 'not.empty', text: 'CONDITION.NOT_EMPTY'},
                    {value: '$like', text: 'CONDITION.LIKE'}
                ]);
                return Observable.of(conditions);
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
                return Observable.of(conditions);
            }
        }
    }

    field(name: string, type: string, pseudo: boolean): FieldConfig {
        return {
            name: 'condition',
            type: 'select',
            pseudo: pseudo,
            value: '',
            validation: [Validators.required],
            label: 'Condition',
            options: this.conditions(name, type),
            placeholder: 'CONDITION.SELECT_CONDITION'
        };
    }
}
