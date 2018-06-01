export class Value {
    public value: any;
    public desc: string;

    constructor(value: any, desc?: string) {
        this.value = value;
        this.desc = desc;
    }

    valueOf() {
        return this.value;
    }
}
