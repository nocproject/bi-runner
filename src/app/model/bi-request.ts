import { JsonMember, JsonObject } from '@upe/typedjson';

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
