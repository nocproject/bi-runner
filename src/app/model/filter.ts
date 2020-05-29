import { JsonProperty, Serializable } from 'typescript-json-serializer';

import { Value } from './value';
import { Range } from './range';
import { Field, FieldBuilder } from './field';

function generateValues(value, self) {
    if (value && self.values) {
        if (value.match(/Date/)) {
            if (self.condition.match(/periodic/)) {
                if (Range.isNotRange(self.values[0].value)) {
                    self.values[0].value = new Date(self.values[0].value);
                }
            }
            if (self.values[1] && self.condition.match(/interval/) && !self.condition.match(/periodic/)) {
                self.values[1].value = new Date(self.values[1].value);
            }
        }
    }
    if (self.field) {
        return self.field.type;
    } else {
        self.field = new FieldBuilder().type(value).build();
    }
    return value;
}

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
    @JsonProperty({type: Field})
    public field: Field;
    @JsonProperty({onDeserialize: generateValues})
    public type: string;
    // form data
    public value: string;

    // static fromJSON(json: any): Filter {
    //     if (json.hasOwnProperty('field')) {
    //         json.type = json.field.type;
    //     } else {
    //         const field = new Field();
    //         field.type = json.type;
    //         json.field = field;
    //     }
    //     if (json.hasOwnProperty('type') && json.hasOwnProperty('values')) {
    //         if (json.type.match(/Date/)) {
    //             if (!json.condition.match(/periodic/)) {
    //                 if (Range.isNotRange(json.values[0].value)) {
    //                     json.values[0].value = new Date(json.values[0].value);
    //                 }
    //             }
    //             if (json.values[1] && json.condition.match(/interval/) && !json.condition.match(/periodic/)) {
    //                 json.values[1].value = new Date(json.values[1].value);
    //             }
    //         }
    //     }
    //     // console.log(Object.assign(Object.create(Filter.prototype), json));
    //     return Object.assign(Object.create(Filter.prototype), json);
    // }

    public isEmpty(): boolean {
        return this.values && this.values.length === 0;
    }

    public getType(): string {
        return this.field.type;
    }

    public isPseudo(): boolean {
        return this.field.pseudo;
    }
}
