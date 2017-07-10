import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Filter } from './filter';
import { Value } from './value';

export class FilterBuilder {
    private filter: Filter = new Filter();

    static initFilter(fb: FormBuilder): FormGroup {
        return fb.group({
            name: ['', [Validators.required]],
            condition: ['', [Validators.required]],
            valueFirst: [''],
            valueSecond: ['']
        });
    }

    constructor() {
        this.filter.association = '$and';
    }

    public name(name: string) {
        this.filter.name = name;
        return this;
    }

    public type(type: string) {
        this.filter.type = type;
        return this;
    }

    public condition(condition: string) {
        this.filter.condition = condition;
        return this;
    }

    public association(association: '$and' | '$or') {
        this.filter.association = association;
        return this;
    }

    public alias(alias: string) {
        this.filter.alias = alias;
        return this;
    }

    public values(values: Value[]): FilterBuilder {
        this.filter.values = values;
        return this;
    }

    public build(): Filter {
        return this.filter;
    }
}
