import { Query } from './query';

export class QueryBuilder {
    private query: Query = new Query();

    constructor() {
        this.query.id = 0;
        this.query.params = [];
    }

    public id(id: number) {
        this.query.id = id;
        return this;
    }

    public method(method: string): QueryBuilder {
        this.query.method = method;
        return this;
    }

    public params(params: any[]): QueryBuilder {
        this.query.params = params;
        return this;
    }

    public build(): Query {
        return this.query;
    }
}
