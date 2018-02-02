import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Field } from './field';
import { Filter } from './filter';
import { Value } from './value';

export class FilterBuilder {
    private filter: Filter = new Filter();

    constructor() {
        this.filter.association = '$and';
    }

    static initFilter(fb: FormBuilder): FormGroup {
        return fb.group({
            name: ['', [Validators.required]],
            condition: ['', [Validators.required]],
            valueFirst: [''],
            valueSecond: ['']
        });
    }

    public name(name: string): FilterBuilder {
        this.filter.name = name;
        return this;
    }

    public type(type: string): FilterBuilder {
        this.filter.type = type;
        return this;
    }

    public condition(condition: string): FilterBuilder {
        this.filter.condition = condition;
        return this;
    }

    public association(association: '$and' | '$or'): FilterBuilder {
        this.filter.association = association;
        return this;
    }

    public alias(alias: string): FilterBuilder {
        this.filter.alias = alias;
        return this;
    }

    public values(values: Value[]): FilterBuilder {
        this.filter.values = values;
        return this;
    }

    public pseudo(pseudo: boolean): FilterBuilder {
        this.filter.pseudo = pseudo;
        return this;
    }

    public datasource(datasource: string): FilterBuilder {
        this.filter.datasource = datasource;
        return this;
    }

    public field(field: Field): FilterBuilder {
        this.filter.field = field;
        return this;
    }

    public build(): Filter {
        return this.filter;
    }
}
