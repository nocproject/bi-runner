import * as _ from 'lodash';
import * as d3 from 'd3';

import { Group } from './group';
import { Filter } from './filter';
import { FilterBuilder } from './filter.builder';
import { Value } from './value';

export class WhereBuilder {
    static makeWhere(groups: Group[]): Object {
        const andFilters = getFilters(groups, '$and');
        const orFilters = getFilters(groups, '$or');

        if (andFilters.length > 0 && orFilters.length > 0) {
            return orValues([andValues(andFilters), orValues(orFilters)]);
        }
        if (andFilters.length > 0) {
            return andValues(andFilters);
        }
        if (orFilters.length > 0) {
            return orValues(orFilters);
        }

        return null;
    }
}

function getFilters(groups: Group[], association: string): Object[] {
    return groups
        .filter(group => group.association === association)
        .map(group => group.filters
            .filter(filter => !filter.isEmpty())
            // hard code
            .map(filter => {
                let values: Value[];
                if (filter.name === 'duration_intervals') {
                    if (filter.condition === 'interval') {
                        const raw = filter.values[0].value.split('-');
                        values = [
                            new Value(d3.time.format('%d.%m.%Y %H:%M').parse(raw[0])),
                            new Value(d3.time.format('%d.%m.%Y %H:%M').parse(raw[1]))
                        ];
                    } else {
                        values = filter.values;
                    }
                    return new FilterBuilder()
                        .name('ts')
                        .condition(`not.${filter.condition}`)
                        .pseudo(false)
                        .values(values)
                        .type(filter.type)
                        .association(filter.association)
                        .alias(filter.alias)
                        .build();
                }
                if (filter.type === 'Date' && typeof filter.values[0].value === 'string') {
                    if (filter.condition.match(/interval/i)) {
                        const raw = filter.values[0].value.split('-');
                        values = [
                            new Value(d3.time.format('%d.%m.%Y').parse(raw[0])),
                            new Value(d3.time.format('%d.%m.%Y').parse(raw[1]))
                        ];
                    } else {
                        values = [new Value(d3.time.format('%d.%m.%Y').parse(filter.values[0].value))];
                    }
                    filter.values = values;
                }
                if (filter.type === 'DateTime' && typeof filter.values[0].value === 'string') {
                    if (!filter.condition.match(/periodic/)) {
                        if (filter.condition.match(/interval/i)) {
                            const raw = filter.values[0].value.split('-');
                            values = [
                                new Value(d3.time.format('%d.%m.%Y %H:%M').parse(raw[0])),
                                new Value(d3.time.format('%d.%m.%Y %H:%M').parse(raw[1]))
                            ];
                        } else {
                            values = [new Value(d3.time.format('%d.%m.%Y %H:%M').parse(filter.values[0].value))];
                        }
                        filter.values = values;
                    }
                }
                return filter;
            })
            .filter(filter => !filter.isPseudo()))
        .filter(active => active.length > 0)
        .map(active => {
            const association = filtersAssociation(active);

            return associationFn(
                association,
                active.map(filter => where(filter))
            );
        });
}

function filtersAssociation(filters: Filter[]): string {
    return filters[0].association;
}

function where(filter: Filter): Object {
    const clonedFilter = _.clone(filter);

    switch (clonedFilter.condition) {
        case 'interval':
        case 'periodic.interval':
            return interval(clonedFilter);
        case 'not.interval':
        case 'not.periodic.interval':
            return not(interval(clonedFilter));
        case 'in':
            return inCondition(clonedFilter);
        case 'not.in':
            return not(inCondition(clonedFilter));
        case 'empty':
            return not(empty(clonedFilter));
        case 'not.empty':
            return notEmpty(clonedFilter);
        case '$selector':
            return {
                $selector: clonedFilter.values[0].value
            };
        default:
            return castToValue(clonedFilter);
    }
}

// conditions
function interval(filter: Filter): Object {
    let from, to;

    switch (filter.type) {
        case 'Date': {
            from = toDate(filter.values[0]);
            to = toDate(filter.values[1]);
            break;
        }
        case 'DateTime': {
            if (filter.condition.match(/periodic/)) {
                const tokens = filter.values[0].value.split('-');

                from = toSeconds(tokens[0]);
                to = toSeconds(tokens[1]);
                filter.name = `toInt32(toTime(${filter.name}))`;
            } else {
                from = toDateTime(filter.values[0]);
                to = toDateTime(filter.values[1]);
            }
            break;
        }
        case 'IPv4': {
            const tokens = filter.values[0].value.split('-');

            from = ipv4StrToNum(tokens[0]);
            to = ipv4StrToNum(tokens[1]);
            break;
        }
        case 'Int16':
        case 'Int32':
        case 'Int64': {
            from = castToNumber(filter.values[0], filter.type);
            to = castToNumber(filter.values[1], filter.type);
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

function inCondition(filter: Filter): Object {
    if (valueLength(filter.values) > 1) {
        return {
            $in: [
                {
                    $field: filter.name
                },
                castToNumberArray(filter)
            ]
        };
    } else {
        return {
            $eq: [
                {
                    $field: filter.name
                },
                castFirstToNumber(filter)
            ]
        };
    }
}

function castToValue(filter: Filter): Object {
    const firstValue = _.first(filter.values);
    const expression: Object = {};
    let fieldValue: Object;

    switch (filter.type) {
        case 'Date': {
            fieldValue = {
                $field: toDate(firstValue)
            };
            break;
        }
        case 'DateTime': {
            fieldValue = {
                $field: toDateTime(firstValue)
            };
            break;
        }
        case 'IPv4': {
            fieldValue = {
                $field: ipv4StrToNum(firstValue.value)
            };
            break;
        }
        case 'String': {
            fieldValue = firstValue.value;
            break;
        }
        default: {
            fieldValue = castFirstToNumber(filter);
        }
    }

    expression[filter.condition] = [{
        $field: filter.name
    }, fieldValue];

    return expression;
}

function castToNumber(item: any, type: string): any {
    if (_.startsWith(type, 'tree-') || _.startsWith(type, 'dict-')) {
        return Number(item.value);
    }
    if (type.match(/int|float/i)) { // Delete mask prompt
        return Number(item.value = item.value.replace(/_/g, ''));
    }
    return item.value;
}

function castFirstToNumber(filter: Filter): any {
    return castToNumber(_.first(filter.values), filter.type);
}

function castToNumberArray(filter: Filter): any[] {
    return _.flattenDeep(filter.values.map(item => castToNumber(item, filter.type)));
}

function ipv4StrToNum(value): string {
    return `IPv4StringToNum('${value}')`;
}

function toDate(v) {
    if (typeof v.value === 'string') {
        v.value = new Date(v.value);
    }
    return `toDate('${d3.time.format('%Y-%m-%d')(v.value)}')`;
}

function toDateTime(v) {
    if (typeof v.value === 'string') {
        v.value = new Date(v.value);
    }
    return `toDateTime('${d3.time.format('%Y-%m-%dT%H:%M:%S')(v.value)}')`;
}

function toSeconds(param) {
    return Number(param.split(':')[0]) * 3600 + Number(param.split(':')[1]) * 60 + 86400;
}

function associationFn(condition: string, filters) {
    return {
        [condition]: filters
    };
}

function andValues(values) {
    return {
        $and: values
    };
}

function orValues(values) {
    return {
        $or: values
    };
}

function empty(filter: Filter) {
    return {
        '$empty': {
            '$field': filter.name
        }
    };
}

function notEmpty(filter: Filter) {
    return {
        '$notEmpty': {
            '$field': filter.name
        }
    };
}

function not(value) {
    return {
        $not: value
    };
}

function valueLength(values: Value[]): number {
    return values.filter(item => item.value).length;
}
