import { Filter } from './filter';
import { Group } from './group';

export class GroupBuilder {
    private group: Group = new Group();

    constructor() {
        this.group.association = '$and';
    }

    public name(name: string) {
        this.group.name = name;
        return this;
    }

    public association(association: string) {
        this.group.association = association;
        return this;
    }

    public filters(filters: Filter[]) {
        this.group.filters = filters;
        return this;
    }

    public build(): Group {
        return this.group;
    }
}
