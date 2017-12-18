import { JsonMember, JsonObject } from '../typed-json';

@JsonObject()
export class Map {
    @JsonMember()
    public name: string;
    @JsonMember({elements: Number})
    public rotate: [number, number, number];
    @JsonMember({elements: Number})
    public center: [number, number];
    @JsonMember()
    public scale: number;
}