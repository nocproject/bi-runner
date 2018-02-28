import { JsonMember, JsonObject } from '@upe/typedjson';

import { isEmpty, max } from 'lodash';
import { BiQuery } from './bi-query';
import { Field } from './field';

@JsonObject()
export class BiRequest {
    @JsonMember()
    public id: number;
    @JsonMember()
    public method: string;
    @JsonMember({elements: BiQuery})
    params: BiQuery[];

    public getFields(): Field[] {
        return this.params[0].fields;
    }

    public getLabeledFields(): Field[] {
        return this.params[0].fields.filter(item => 'label' in item);
    }

    public setField(fields): void {
        this.params[0].fields = fields;
    }

    public setLimit(limit: number): void {
        this.params[0].limit = +limit;
    }

    public getWhere(): Object {
        return this.params[0].filter;
    }

    public getFirstField(): string {
        return this.params[0].fields[0].expr.toString();
    }

    public maxGroupBy(): number {
        if (this.isGroupBy()) {
            return max(this.getFieldsValueByAttr('group')) + 1;
        }
        return 1;
    };

    public maxOrder(): number {
        if (this.isSortable()) {
            return max(this.getFieldsValueByAttr('order', 'desc')) + 1;
        }
        return 1;
    };

    public isGroupBy(): boolean {
        return this.getFieldsValueByAttr('group').length > 0;
    }

    public isSortable(): boolean {
        return this.getFieldsValueByAttr('order', 'desc').length > 0;
    }

    private getFieldsValueByAttr(name: string, by: string = name): number[] {
        return this.params[0].fields
            .filter(field => by in field)
            .map(field => field[name]);
    }

    public static isNumeric(field: Field): boolean {
        if (isEmpty(field)) return false;
        return ['UInt8', 'UInt16', 'UInt32', 'UInt64', 'Int8', 'Int16', 'Int32', 'Int64', 'Float32', 'Float64'].indexOf(field.type) !== -1;
    }
}

export class BiRequestBuilder {
    private request: BiRequest = new BiRequest();

    constructor() {
        this.request.id = 0;
        this.request.params = [];
    }

    public id(id: number) {
        this.request.id = id;
        return this;
    }

    public method(method: string): BiRequestBuilder {
        this.request.method = method;
        return this;
    }

    public params(params: any[]): BiRequestBuilder {
        this.request.params = params;
        return this;
    }

    public build(): BiRequest {
        return this.request;
    }
}
