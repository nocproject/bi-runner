import { JsonProperty, Serializable } from 'typescript-json-serializer';

@Serializable()
export class Map {
    @JsonProperty()
    public name: string;
    @JsonProperty()
    public rotate: [number, number, number];
    @JsonProperty()
    public center: [number, number];
    @JsonProperty()
    public scale: number;
}
