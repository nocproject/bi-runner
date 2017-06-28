import { JsonObject, JsonMember } from 'typedjson-npm/src/typed-json';

@JsonObject
export class Cell {
    @JsonMember
    public md: number;
    @JsonMember
    public name: string;
    @JsonMember
    public lg: number;
    @JsonMember
    public height: number;
    @JsonMember
    public sm: number;
    @JsonMember
    public xs: number;
    @JsonMember
    public row: number;

    public getClasses(): string {
        const classes: string[] = [];
        if (this.md) {
            classes.push('col-md-' + this.md);
        }
        if (this.lg) {
            classes.push('col-lg-' + this.lg);
        }
        if (this.sm) {
            classes.push('col-sm-' + this.sm);
        }
        if (this.xs) {
            classes.push('col-xs-' + this.xs);
        }
        return classes.join(' ');
    }
}
