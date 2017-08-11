import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';

import { IOption } from '../../model';
import { FieldConfig } from '../models/form-config.interface';

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
                    {value: '$selector', text: 'select'}
                ];
                return Observable.of(conditions);
            }
            case 'DateTime': {
                if ('duration_intervals' === name) {
                    conditions = [
                        {value: 'interval', text: 'interval'},
                        {value: 'periodic.interval', text: 'periodic interval'}
                    ];
                } else {
                    conditions = conditions.concat([
                        {value: 'interval', text: 'interval'},
                        {value: 'not.interval', text: 'not in interval'},
                        {value: 'periodic.interval', text: 'periodic interval'},
                        {value: 'not.periodic.interval', text: 'not in periodic'},
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
                    {value: 'interval', text: 'interval'},
                    {value: 'not.interval', text: 'not in interval'},
                    {value: '$lt', text: '<'},
                    {value: '$lte', text: '<='},
                    {value: '$gt', text: '>'},
                    {value: '$gte', text: '>='}
                ]);
                return Observable.of(conditions);
            }
            case 'IPv4': {
                conditions = conditions.concat([
                    {value: 'interval', text: 'interval'},
                    {value: 'not.interval', text: 'not in interval'},
                    {value: '$lt', text: '<'},
                    {value: '$gt', text: '>'}
                ]);
                return Observable.of(conditions);
            }
            case 'String': {
                conditions = conditions.concat([
                    {value: 'empty', text: 'empty'},
                    {value: 'not.empty', text: 'not empty'},
                    {value: '$like', text: 'like'}
                ]);
                return Observable.of(conditions);
            }
            default: {
                conditions = conditions.concat([
                    {value: 'interval', text: 'interval'},
                    {value: 'not.interval', text: 'not in interval'},
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
            placeholder: 'Select Condition'
        };
    }
}
