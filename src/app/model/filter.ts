import { JsonProperty, Serializable } from 'typescript-json-serializer';

import { Value } from './value';
import { Range } from './range';
import { Field, FieldBuilder } from './field';

@Serializable()
export class Filter {
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
    @JsonProperty({
        onDeserialize: (value, self) => {
            if (self.field) {
                return self.field.type;
            }
            self.field = new FieldBuilder().type(value).build();
            return value;
        }
    })
    public type: string;
    @JsonProperty({
        name: 'values',
        onDeserialize: (value, self) => {
            const type = self.type ? self.type : self.field.type;
            return value.map(v => {
                if (type.match(/Date/) && Range.isNotRange(v.value)) { // isNotRange use for validate date
                    return {value: new Date(v.value)};
                }
                return v;
            });
        }
    })
    public values: Value[];

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
