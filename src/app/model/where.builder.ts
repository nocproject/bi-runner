import * as _ from 'lodash';
import * as d3 from 'd3';

import { Group } from './group';
import { Filter } from './filter';

// ToDo refactor!
export class WhereBuilder {

    static makeWhere(groups: Group[]): Object {
        // if (groups.length === 1) {
        //     const group = groups[0];
        //     const activeFilters = group.filters
        //         .filter(filter => !filter.isEmpty());
        //
        //     if (activeFilters.length > 0) {
        //         const value = {};
        //         value[group.association] = activeFilters.map(filter => this.where(filter));
        //         return value;
        //     } else {
        //         return null;
        //     }
        // }

        // return this.association('$and', filters);
        const andFilters = this.getFilters(groups, '$and');
        console.log('and : ', JSON.stringify(andFilters));
        const orFilters = this.getFilters(groups, '$or');
        console.log('or : ', JSON.stringify(orFilters));
        if (andFilters.length > 0 && orFilters.length > 0) {
            return this.orValues([andFilters, orFilters]);
            // return this.orValues([this.andValues(andFilters), orFilters]);
        }
        if (andFilters.length > 0) {
            return this.andValues(andFilters);
        }
        if (orFilters.length > 0) {
            return this.orValues(orFilters);
        }
        return null;
    }

    static getFilters(groups: Group[], association: string): Object[] {
        return groups
            .filter(group => group.association === association)
            .map(group => {
                const activeFilters = group.filters
                    .filter(filter => !filter.isEmpty());

                if (activeFilters.length > 0) {
                    const association = this.filtersAssociation(group);

                    if (association) {
                        return this.association(
                            association,
                            activeFilters.map(filter => this.where(filter))
                        );
                    }
                    return activeFilters.map(filter => this.where(filter));
                }
            });
    }

    static filtersAssociation(group: Group): string {
        return group.filters[0].association;
    }

    static where(filter: Filter): Object {
        const clonedFilter = _.clone(filter);

        switch (clonedFilter.condition) {
            case 'interval':
                return this.interval(clonedFilter);
            case 'in':
                return this.in(clonedFilter);
            case 'empty':
                return this.empty(clonedFilter);
            case 'not.empty':
                return this.notEmpty(clonedFilter);
            // case '$gt':
            //
            default:
                console.warn(`where default case! condition is '${clonedFilter.condition}'`);
                return this.castValue(clonedFilter);
        }
    }

    // conditions
    static interval(filter: Filter): Object {
        let from, to;

        switch (filter.type) {
            case 'Date': {
                from = this.toDate(filter.values[0]);
                to = this.toDate(filter.values[1]);
                break;
            }
            case 'DateTime': {
                from = this.toDateTime(filter.values[0]);
                to = this.toDateTime(filter.values[1]);
                break;
            }
            case 'IPv4': {
                from = this.ipv4StrToNum(filter.values[0]);
                to = this.ipv4StrToNum(filter.values[1]);
                break;
            }
            case 'Int16':
            case 'Int32':
            case 'Int64': {
                from = this.toInt(filter.type, filter.values[0]);
                to = this.toInt(filter.type, filter.values[1]);
                break;
            }
            case 'String': {
                return {
                    $between: [{
                        $field: filter.name
                    }, from, to
                    ]
                };
            }
            default: {
                return {
                    $between: [{
                        $field: filter.name
                    },
                        filter.values[0].value,
                        filter.values[1].value
                    ]
                };
            }
        }
        return {
            $between: [{
                $field: filter.name
            }, {
                $field: from
            }, {
                $field: to
            }]
        };
    }

    static in(filter: Filter): Object {

        if (filter.values.length > 1) {
            return {
                $in: [
                    {
                        $field: filter.name
                    },
                    this.castToNumberArray(filter)
                ]
            };
        } else {
            return {
                $eq: [
                    {
                        $field: filter.name
                    },
                    this.castFirstToNumber(filter)
                ]
            };
        }
    }

    static castValue(filter: Filter): Object {
        const firstValue = _.first(filter.values);
        const expression: Object = {};
        let fieldValue: Object;

        switch (filter.type) {
            case 'Date': {
                fieldValue = {
                    $field: this.toDate(firstValue.value)
                };
                break;
            }
            case 'DateTime': {
                fieldValue = {
                    $field: this.toDateTime(firstValue.value)
                };
                break;
            }
            case 'IPv4': {
                fieldValue = {
                    $field: this.ipv4StrToNum(firstValue.value)
                };
                break;
            }
            case 'String': {
                fieldValue = firstValue.value;
                break;
            }
            default: {
                fieldValue = this.castFirstToNumber(filter);
            }
        }

        expression[filter.condition] = [{
            $field: filter.name
        }, fieldValue];

        return expression;
    }

    static castToNumber(item: any, type: string): any {
        if (_.startsWith(type, 'tree-') || _.startsWith(type, 'dict-') || type.match(/int|float/i)) {
            return Number(item.value);
        }
        return item.value;
    }

    static castFirstToNumber(filter: Filter): any {
        return this.castToNumber(_.first(filter.values), filter.type);
    }

    static castToNumberArray(filter: Filter): any[] {
        return _.flattenDeep(filter.values.map(item => this.castToNumber(item, filter.type)));
    }

    static ipv4StrToNum(v): string {
        return `IPv4StringToNum('${v.value}')`;
    }

    static toDate(v) {
        return `toDate('${d3.time.format('%Y-%m-%d')(v.value)}')`;
    }

    static toDateTime(v) {
        return `toDateTime('${d3.time.format('%Y-%m-%dT%H:%M:%S')(v.value)}')`;
    }

    static toInt(type, v) {
        const suffix = type.replace('Int', '');

        return `toInt${suffix}('${v.value}')`;
    }

    static toSeconds(param) {
        return Number(param.split(':')[0]) * 3600 + Number(param.split(':')[1]) * 60 + 86400;
    }

    static association(condition: string, filters) {
        return {
            [condition]: filters
        };
    }

    static andValues(values) {
        return {
            $and: values
        };
    }

    static orValues(values) {
        return {
            $or: values
        };
    }

    static empty(filter: Filter) {
        return {
            '$empty': {
                '$field': filter.name
            }
        };
    }

    static notEmpty(filter: Filter) {
        return {
            '$notEmpty': {
                '$field': filter.name
            }
        };
    }
}
