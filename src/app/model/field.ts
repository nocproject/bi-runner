import { JsonMember, JsonObject } from '@upe/typedjson';

import { Expression } from './expression';

@JsonObject({initializer: Field.fromJSON, knownTypes: [Expression]})
export class Field {
    // @JsonMember
    public expr: string;
    @JsonMember()
    public label: string;
    @JsonMember()
    public alias: string;
    @JsonMember()
    public desc: boolean;
    @JsonMember({type: Number})
    public order: number;
    @JsonMember({type: Number})
    public group: number;
    @JsonMember()
    public format: string;
    @JsonMember()
    public name: string;
    @JsonMember()
    public description: string;
    @JsonMember()
    public dict: string;
    @JsonMember()
    public type: string;
    @JsonMember()
    public model: string;
    @JsonMember()
    public pseudo: boolean;
    @JsonMember()
    public enable: boolean;
    @JsonMember()
    public aggFunc: string;
    //
    public hide: boolean | string;
    public isSelectable: boolean;
    public isGrouping: boolean;
    public grouped: boolean;
    public datasource: string;
    public isAgg: boolean;

    public isSortable(): boolean {
        return 'desc' in this;
    }

    static fromJSON(json) {
        json['isSelectable'] = true;
        json['isGrouping'] = true;
        json['grouped'] = false;
        json['isAgg'] = false;

        // if (json.hasOwnProperty('expr')) {
        //     if (typeof json['expr'] === 'object') {
        //         json['expr'].__type = 'Expression';
        //     }
        // }
        if (json.hasOwnProperty('is_agg')) {
            json['isAgg'] = json['is_agg'];
            delete json['is_agg'];
        }
        if (json.hasOwnProperty('hide')) {
            json['hide'] = json['hide'] === 'yes' || json['hide'] === 'true';
        }
        return Object.assign(Object.create(Field.prototype), json);
    }
}

export class FieldBuilder {
    private field: Field = new Field();

    public alias(alias: string): FieldBuilder {
        this.field.alias = alias;
        return this;
    }

    public label(label: string): FieldBuilder {
        this.field.label = label;
        return this;
    }

    public expr(expr): FieldBuilder {
        this.field.expr = expr;
        return this;
    }

    public datasource(datasource: string): FieldBuilder {
        this.field.datasource = datasource;
        return this;
    }

    public description(description: string): FieldBuilder {
        this.field.description = description;
        return this;
    }

    public type(type: string): FieldBuilder {
        this.field.type = type;
        return this;
    }

    public build(): Field {
        return this.field;
    }
}
