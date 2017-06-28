import { JsonObject, JsonMember } from 'typedjson-npm/src/typed-json';

import { Parameter } from './parameter';
import { Field } from './field';

@JsonObject
export class Query {
    @JsonMember
    public id: number;
    @JsonMember
    public method: string;
    @JsonMember({elements: Parameter})
    params: Parameter[];

    public getFields(): Field[] {
        return this.params[0].fields;
    }

    public getLabeledFields(): Field[] {
        return this.params[0].fields.filter(item => 'label' in item);
    }

    public getWhere(): Object {
        return this.params[0].filter;
    }

    public getFirstField(): string {
        return this.params[0].fields[0].expr.toString();
    }

    public maxGroup(): number {
        const maxGroup = Math.max.apply(Math,
            this.params[0].fields
                .filter(function (element) {
                    return element.hasOwnProperty('group');
                })
                .map(function (element) {
                    return element.group;
                }));
        return (maxGroup === -Infinity || isNaN(maxGroup)) ? 1 : maxGroup + 1;
    };
}
