import { ValidatorFn } from '@angular/forms';

import { Observable } from 'rxjs/Observable';

import { Field, IOption } from '@app/model';

export interface FiltersFormConfig {
    groups: FilterGroupConfig[];
}

export interface FilterGroupConfig {
    association: '$and' | '$or';
    active: boolean;
    group: FiltersConfig;
}

export interface FiltersConfig {
    association: '$and' | '$or';
    filters: FilterConfig[];
}

export interface FilterConfig {
    name: string;
    condition: string;
    value: string;
    conditionField: FieldConfig;
    valueField$: Observable<FieldConfig>;
    // for restore only
    field?: Field;
    data?: any;
}

export interface FieldConfig {
    controlName: string;
    type: string;
    label: string;
    placeholder: string;
    disabled: boolean;
    validation: ValidatorFn[];
    value: any;
    options?: Observable<IOption[]>;
}
