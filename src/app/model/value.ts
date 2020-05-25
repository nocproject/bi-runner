import { JsonProperty, Serializable } from 'typescript-json-serializer';

@Serializable()
export class Value {
    @JsonProperty()
    public value: any;
    @JsonProperty()
    public desc: string;

    constructor(value: any, desc?: string) {
        this.value = value;
        this.desc = desc;
    }

    valueOf() {
        return this.value;
    }
}
