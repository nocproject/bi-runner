import { ValidatorFn } from '@angular/forms';

import { Observable } from 'rxjs/Rx';

import { IOption } from 'app/model';

export interface FormConfig {
    groups: GroupConfig[];
}

export interface GroupConfig {
    association: '$and' | '$or';
    active: boolean;
    group: FiltersConfig;
}

export interface FiltersConfig {
    association: '$and' | '$or';
    filters: FieldConfig[][];
}

export interface FieldConfig {
    name: string;
    type: string;
    pseudo: boolean;
    dict?: string;
    model?: string;
    description?: string;
    expr?: string;
    datasource?: string;
    disabled?: boolean;
    label?: string;
    mask?: string;
    options?: Observable<IOption[]>;
    placeholder?: string;
    validation?: ValidatorFn[];
    value?: any;
}
