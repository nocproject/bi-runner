import { JsonProperty, Serializable } from 'typescript-json-serializer';

export type YesNo = 'yes' | 'no';

@Serializable()
export class Field {
    @JsonProperty()
    public expr: string | {};
    @JsonProperty()
    public label: string;
    @JsonProperty()
    public alias: string;
    @JsonProperty()
    public desc: boolean;
    @JsonProperty()
    public order: number;
    @JsonProperty()
    public group: number;
    @JsonProperty()
    public format: string;
    @JsonProperty()
    public name: string;
    @JsonProperty()
    public description: string;
    @JsonProperty()
    public dict: string;
    @JsonProperty()
    public type: string;
    @JsonProperty()
    public model: string;
    @JsonProperty()
    public pseudo: boolean;
    @JsonProperty()
    public enable: boolean;
    @JsonProperty()
    public aggFunc: string;
    @JsonProperty({
        onDeserialize: (value) => value === 'yes' || value === 'true',
        onSerialize: (value) => value ? 'yes' : 'no'
    })
    public hide: boolean | YesNo;
    @JsonProperty()
    public allowAggFuncs: boolean;
    //
    // @JsonProperty()
    public isSelectable: boolean = true;
    // @JsonProperty()
    public isGrouping: boolean = true;
    // @JsonProperty()
    public grouped: boolean = false;
    // @JsonProperty({name: 'is_agg'})
    public isAgg: boolean = false;
    @JsonProperty()
    public datasource: string;

    public isSortable(): boolean {
        return 'desc' in this;
    }
}

export class FieldBuilder {
    private field: Field = new Field();

    public name(name: string): FieldBuilder {
        this.field.name = name;
        return this;
    }

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

    public group(group: number): FieldBuilder {
        this.field.group = group;
        return this;
    }

    public order(order: number): FieldBuilder {
        this.field.order = order;
        return this;
    }

    public desc(desc: boolean): FieldBuilder {
        this.field.desc = desc;
        return this;
    }

    public pseudo(pseudo: boolean): FieldBuilder {
        this.field.pseudo = pseudo;
        return this;
    }

    public isSelectable(isSelectable: boolean): FieldBuilder {
        this.field.isSelectable = isSelectable;
        return this;
    }

    public isGrouping(isGrouping: boolean): FieldBuilder {
        this.field.isGrouping = isGrouping;
        return this;
    }

    public grouped(grouped: boolean): FieldBuilder {
        this.field.grouped = grouped;
        return this;
    }

    public hide(hide: boolean | YesNo): FieldBuilder {
        if (typeof hide === 'boolean') {
            this.field.hide = hide;
        }
        return this;
    }

    public build(): Field {
        return this.field;
    }
}
