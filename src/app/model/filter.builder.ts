import { isUndefined } from 'lodash';

import { Field } from './field';
import { Filter } from './filter';
import { Value } from './value';

export class FilterBuilder {
    private filter: Filter = new Filter();

    constructor() {
        this.filter.association = '$and';
    }

    public name(name: string): FilterBuilder {
        this.filter.name = name;
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

    public field(field: Field): FilterBuilder {
        this.filter.field = field;
        return this;
    }

    public type(type: string): FilterBuilder {
        if (isUndefined(this.filter.field)) {
            this.filter.field = new Field();
        }
        this.filter.field.type = type;
        return this;
    }

    public build(): Filter {
        return this.filter;
    }
}
