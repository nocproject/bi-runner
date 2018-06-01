import { Filter } from './filter';
import { Group } from './group';

export class GroupBuilder {
    private group: Group = new Group();

    constructor() {
        this.group.association = '$and';
        this.group.active = true;
    }

    public name(name: string): GroupBuilder {
        this.group.name = name;
        return this;
    }

    public active(active: boolean): GroupBuilder {
        this.group.active = active;
        return this;
    }

    public association(association: '$and' | '$or'): GroupBuilder {
        this.group.association = association;
        return this;
    }

    public filters(filters: Filter[]): GroupBuilder {
        this.group.filters = filters;
        return this;
    }

    public range(range: boolean): GroupBuilder {
        this.group.range = range;
        return this;
    }

    public build(): Group {
        return this.group;
    }
}
