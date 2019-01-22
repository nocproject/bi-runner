import { cloneDeep, head, startsWith } from 'lodash';
import * as d3 from 'd3';

import { Group } from './group';
import { Filter } from './filter';
import { FilterBuilder } from './filter.builder';
import { Value } from './value';
import { Range } from './range';
import { Field, FieldBuilder } from './field';

export class WhereBuilder {
    static makeWhere(groups: Group[], isWhere: boolean): Object {
        let andFilters = getFilters(groups, '$and', isWhere);
        const orFilters = getFilters(groups, '$or', isWhere);

        if (isWhere) {
            andFilters = andFilters.concat(reportRange(groups));
        }
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

function reportRange(groups: Group[]) {
    return groups
        .filter(group => group.name === 'startEnd')
        .map(group => {
            if (group.range) {
                let [from, to] = getDateTime(group.filters[0]);
                return not(
                    orValues([
                        andValues([condition('$lte', from, 'ts'), condition('$lte', to, 'ts')]),
                        andValues([condition('$gte', from, 'close_ts'), condition('$gte', to, 'close_ts')])
                    ])
                );
            }
            return andValues([interval(group.filters[0])]);
        });
}

function getFilters(groups: Group[], association: string, isWhere: boolean): Object[] {
    return groups
        .filter(group => group.name !== 'startEnd')
        .filter(group => group.active)
        .filter(group => group.association === association)
        .map(group => group.filters
            .filter(filter => !filter.isEmpty())
            .filter(filter => {
                const toHaving = (filter.field.isAgg || false) && group.name === 'form';

                if (!isWhere && toHaving) return true;
                if (!isWhere && !toHaving) return false;
                if (isWhere && toHaving) return false;
                if (isWhere && !toHaving) return true;
            })
            // hard code, add filter
            .map(filter => {
                if (filter.name === 'exclusion_intervals') {
                    const condition = filter.condition.startsWith('not.')
                        ? filter.condition.replace('not.', '') : `not.${filter.condition}`;
                    return new FilterBuilder()
                        .name('ts')
                        .condition(condition)
                        .values(filter.values)
                        .association(filter.association)
                        .alias(filter.alias)
                        .field(new FieldBuilder()
                            .type(filter.getType())
                            .pseudo(false)
                            .build())
                        .build();
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
    const clonedFilter = cloneDeep(filter);

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
            return empty(clonedFilter);
        case 'not.empty':
            return not(empty(clonedFilter));
        case '$selector':
            return {
                $selector: clonedFilter.values[0].value
            };
        case '$like':
            return like(clonedFilter);
        case 'not.$hasAny':
            return not(hasAny(clonedFilter));
        case '$hasAny':
            return hasAny(clonedFilter);
        default:
            return castToCondition(clonedFilter);
    }
}

// conditions
function interval(filter: Filter): Object {
    let from, to;

    switch (filter.getType()) {
        case 'Date': {
            from = toDate(filter.values[0]);
            to = toDate(filter.values[1]);
            break;
        }
        case 'DateTime': {
            [from, to] = getDateTime(filter);
            break;
        }
        case 'IPv4': {
            const tokens = filter.values[0].value.split(' - ');

            from = ipv4StrToNum(tokens[0]);
            to = ipv4StrToNum(tokens[1]);
            break;
        }
        case 'UInt8':
        case 'UInt16':
        case 'UInt32':
        case 'UInt64':
        case 'Int8':
        case 'Int16':
        case 'Int32':
        case 'Int64':
        case 'Float32':
        case 'Float64': {
            const tokens = filter.values[0].value.split(' - ');
            from = tokens[0];
            to = tokens[1];
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
    if (startsWith(filter.getType(), 'Tree') || startsWith(filter.getType(), 'tree-')) {
        return {
            $in: [
                {
                    $field: filter.name
                },
                filter.values[0].value
            ]
        };
    }

    if (valueLength(filter.values) > 1) {
        return {
            $in: [
                {
                    $field: filter.name
                },
                castToArray(filter)
            ]
        };
    } else {
        return {
            $eq: [
                {
                    $field: filter.name
                },
                castToField(filter.values, filter.getType())
            ]
        };
    }
}

function castToValue(value: Value, type: string): any {
    switch (type) {
        case 'Date' : {
            return toDate(value);
        }
        case 'DateTime' : {
            return toDateTime(value);
        }
        case 'IPv4' : {
            return ipv4StrToNum(value.value);
        }
        default: {
            return value.value;
        }
    }
}

function castToField(values: Value[], type: string): Object {
    const firstValue = head(values);
    let fieldValue: Object;

    switch (type) {
        case 'Date':
        case 'DateTime':
        case 'IPv4': {
            fieldValue = {
                $field: castToValue(firstValue, type)
            };
            break;
        }
        case 'String': {
            fieldValue = firstValue.value;
            break;
        }
        case 'Array(String)': {
            fieldValue = [firstValue.value];
            break;
        }
        default: {
            fieldValue = head(values).value;
        }
    }
    return fieldValue;
}

function castToCondition(filter: Filter) {
    const expression: Object = {};
    const func = getAggFunc(filter.field);
    // ToDo 'avg' must be save into board config
    expression[filter.condition] = [{
        $field: (filter.field.isAgg || false) ? `${func}Merge(${filter.name}_${func})` : filter.name
    }, castToField(filter.values, filter.getType())];

    return expression;
}

function getAggFunc(field: Field): string {
    if (field) {
        return field.aggFunc || 'avg';
    }
    return 'avg';
}

function castToArray(filter: Filter): any[] {
    return filter.values.map(value => castToValue(value, filter.getType()));
}

function ipv4StrToNum(value): string {
    return `IPv4StringToNum('${value}')`;
}

function toDate(v: Value) {
    if (typeof v.value === 'string') {
        v.value = new Date(v.value);
    }
    return `toDate('${d3.time.format('%Y-%m-%d')(v.value)}')`;
}

function toDateTime(v: Value) {
    if (typeof v.value === 'string') {
        v.value = new Date(v.value);
    }
    return `'${d3.time.format('%Y-%m-%dT%H:%M:%S')(v.value)}'`;
}

function toPeriodicTime(param) {
    const [h, m] = param.split(':').map(n => Number(n));
    return `toDateTime('1970-01-02 ${padNumber(h)}:${padNumber(m)}:00')`;
}

function padNumber(d: number): string {
    return d < 10 ? '0' + d : d.toString();
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

function condition(condition: string, col: string, value: string) {
    return {
        [condition]: [
            {
                $field: col
            },
            {
                $field: value
            }
        ]
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

function not(value) {
    return {
        $not: value
    };
}

function like(filter: Filter) {
    return {
        $like: [
            {
                $lower: {$field: filter.name}
            }, {
                $lower: `%${filter.values[0].value}%`
            }
        ]
    };
}

function hasAny(filter: Filter) {
    return {
        $hasAny: [
            {
                $field: filter.name
            },
            [`${filter.values[0].value}`]

        ]
    };
}

function valueLength(values: Value[]): number {
    return values.filter(item => item.value).length;
}

function getDateTime(filter: Filter) {
    let from, to;

    if (filter.condition.match(/periodic/)) {
        const tokens = filter.values[0].value.split(' - ');

        from = toPeriodicTime(tokens[0]);
        to = toPeriodicTime(tokens[1]);
        filter.name = `toTime(${filter.name})`;
    } else if (filter.values.length === 1) {
        const dates: Value[] = Range.getValues(filter.values[0].value);
        from = toDateTime(dates[0]);
        to = toDateTime(dates[1]);
    } else {
        from = toDateTime(filter.values[0]);
        to = toDateTime(filter.values[1]);
    }
    return [from, to];
}
