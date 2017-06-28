import { ValidatorFn } from '@angular/forms';

import { Observable } from 'rxjs/Observable';

import { IOption } from '../../model';

export interface FormConfig {
    groups: GroupConfig[];
}

export interface GroupConfig {
    association: '$and' | '$or';
    group: FiltersConfig;
}

export interface FiltersConfig {
    association: '$and' | '$or';
    filters: FieldConfig[][];
}

export interface FieldConfig {
    name: string;
    type: string;
    disabled?: boolean;
    label?: string;
    mask?: string;
    options?: Observable<IOption[]>;
    placeholder?: string;
    validation?: ValidatorFn[];
    value?: any;
}
