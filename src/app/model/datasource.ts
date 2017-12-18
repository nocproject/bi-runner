import { JsonMember, JsonObject, TypedJSON } from '../typed-json';
import { Field } from './field';

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

    static fromJSON(json: any): Datasource {
        return TypedJSON.parse(json, Datasource);
    }
}
