import { JsonMember, JsonObject } from '@upe/typedjson';

import { Value } from './value';
import { Range } from './range';
import { Field } from './field';

@JsonObject({initializer: Filter.fromJSON})
export class Filter {
    @JsonMember({elements: Value})
    public values: Value[];
    @JsonMember()
    public condition: string;
    @JsonMember()
    public name: string;
    @JsonMember()
    public association: '$and' | '$or';
    @JsonMember()
    public alias: string;
    // form data
    public value: string;
    @JsonMember()
    public field: Field;

    static fromJSON(json: any): Filter {
        if (json.hasOwnProperty('field')) {
            json.type = json.field.type;
        } else {
            const field = new Field();
            field.type = json.type;
            json.field = field;
        }
        if (json.hasOwnProperty('type') && json.hasOwnProperty('values')) {
            if (json.type.match(/Date/)) {
                if (!json.condition.match(/periodic/)) {
                    if (Range.isNotRange(json.values[0].value)) {
                        json.values[0].value = new Date(json.values[0].value);
                    }
                }
                if (json.values[1] && json.condition.match(/interval/) && !json.condition.match(/periodic/)) {
                    json.values[1].value = new Date(json.values[1].value);
                }
            }
        }
        // console.log(Object.assign(Object.create(Filter.prototype), json));
        return Object.assign(Object.create(Filter.prototype), json);
    }

    public isEmpty(): boolean {
        return this.values && this.values.length === 0;
    }

    public getType(): string {
        return this.field.type
    }

    public isPseudo(): boolean {
        return this.field.pseudo;
    }
}
