import { JsonMember, JsonObject, TypedJSON } from '../typed-json';

@JsonObject()
export class User {
    @JsonMember()
    public username: string;
    @JsonMember({name: 'last_name'})
    public lastName?: string;
    @JsonMember({name: 'first_name'})
    public firstName?: string;

    static fromJSON(json: any): User {
        return TypedJSON.parse(json, User);
    }

    public display(): string {
        let name = this.username;

        if (this.firstName && this.firstName.length > 0
            && this.lastName && this.lastName.length > 0) {
            name = `${this.firstName} ${this.lastName}`;
        } else if (this.firstName && this.firstName.length > 0) {
            name = this.firstName;
        } else if (this.lastName && this.lastName.length > 0) {
            name = this.lastName;
        }

        return name;
    }
}
