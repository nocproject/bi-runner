export class Value {
    public value: any;
    public desc: string;

    constructor(values: any, desc?: string) {
        this.value = values;
        this.desc = desc;
    }

    valueOf() {
        return this.value;
    }
}
