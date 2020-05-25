import { JsonProperty, Serializable } from 'typescript-json-serializer';

@Serializable()
export class Cell {
    @JsonProperty()
    public md: number;
    @JsonProperty()
    public name: string;
    @JsonProperty()
    public lg: number;
    @JsonProperty()
    public height: number;
    @JsonProperty()
    public sm: number;
    @JsonProperty()
    public xs: number;
    @JsonProperty()
    public row: number;
    @JsonProperty()
    public offset: number;

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
