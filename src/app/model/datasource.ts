import { JsonMember, JsonObject, TypedJSON } from '@upe/typedjson';
import { Field } from './field';
import { IOption } from './ioption';

@JsonObject()
export class Datasource {
    @JsonMember()
    public name: string;
    @JsonMember()
    public description: string;
    @JsonMember({elements: Field, name: 'fields'})
    public fields: Field[];
    @JsonMember()
    public sample: boolean;
    public options: IOption[];

    static fromJSON(json: any): Datasource {
        return TypedJSON.parse(json, Datasource);
    }
}
