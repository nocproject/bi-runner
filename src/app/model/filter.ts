import { JsonProperty, Serializable } from 'typescript-json-serializer';

import { Value } from './value';
import { Range } from './range';
import { Field } from './field';

@Serializable()
export class Filter {
    @JsonProperty({type: Value})
    public values: Value[];
    @JsonProperty()
    public condition: string;
    @JsonProperty()
    public name: string;
    @JsonProperty()
    public association: '$and' | '$or';
    @JsonProperty()
    public alias: string;
    // form data
    public value: string;
    @JsonProperty()
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
