import { Serializable, JsonProperty } from 'typescript-json-serializer';

import { max, startsWith } from 'lodash';
import { BiQuery } from './bi-query';
import { Field, FieldBuilder } from './field';

@Serializable()
export class BiRequest {
    @JsonProperty()
    public id: number;
    @JsonProperty()
    public method: string;
    @JsonProperty({type: BiQuery})
    params: BiQuery[];

    public getFields(): Field[] {
        return this.params[0].fields;
    }

    public getLabeledFields(): Field[] {
        return this.params[0].fields.filter(item => 'label' in item);
    }

    public setFields(fields): void {
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

    public createField(data: any, field: Field) {
        let alias = data.name;
        let expr = data.name;
        const sortable = data.sortable || false;
        const fieldQty = this.getFields().filter(field => startsWith(field.alias, alias)).length;

        if (fieldQty) {
            alias += `${fieldQty}`;
        }

        if (startsWith(field.type, 'dict-') || startsWith(field.type, 'tree-')) {
            alias += '_txt';
            expr = {
                '$lookup': [
                    field.dict,
                    {
                        '$field': data.name
                    }
                ]
            };
        }

        if (field.isAgg) {
            const prop = `$${field.aggFunc}Merge`;
            expr = {};
            expr[prop] = [
                {
                    '$field': `${data.name}_${field.aggFunc}`
                }
            ];
        }

        const newField: Field = new FieldBuilder()
            .expr(expr)
            .alias(alias)
            .label(data.label)
            .build();

        if (data.format) {
            newField.format = data.format;
        }

        if (sortable) {
            newField.desc = true;
            newField.order = this.maxOrder();
        }

        if (this.isGroupBy() && !field.isAgg) {
            newField.group = this.maxGroupBy();
        }
        return newField;
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
