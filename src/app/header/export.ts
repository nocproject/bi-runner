import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import * as d3 from 'd3';

import { APIService, FilterService } from '../services';
import { Board, Field, Filter, Group, Methods, QueryBuilder, Query, Result, WhereBuilder } from '../model';

export class Export {

    static query(api: APIService,
                 filterService: FilterService): Observable<Result> {
        const board: Board = _.clone(filterService.boardSubject.getValue());
        const groups: Field[] = filterService.allGroups();
        const filters: Group[] = filterService.allFilters();
        const where = WhereBuilder.makeWhere(filters);
        const fields = groups
            .filter(field => field.hasOwnProperty('group'))
            .map(field => field.expr)
            .join(',');
        const params = {
            datasource: board.datasource,
            fields: []
        };
        const durationFilters: Filter[] = filterService.allFiltersByName('duration_intervals');

        if (durationFilters.length > 0) {
            const rangeGroup = _.first(filterService.getFilter('startEnd'));
            if (!rangeGroup) {
                return Observable.throw('You must set report range!');
            }
            const range = reportRange(rangeGroup);
            params.fields = groups.filter(field => field.hasOwnProperty('group'));
            params.fields.push(durationByReport(range));
            params.fields.push(durationByZebra(range, durationFilters));
        }
        if (!fields) {
            const response = new Result();

            response.data = {result: [['0']]};
            return Observable.of(response);
        }

        if (where) {
            params['filter'] = where;
        }

        const query: Query = new QueryBuilder()
            .method(Methods.QUERY)
            .params([params])
            .build();
        return api.execute(query);
    }

}

function durationByReport(values: any[]) {
    const startDate = toDateTime(values[0]);
    const endDate = toDateTime(values[1]);

    return {
        expr: {
            $sum: [
                {
                    $minus: [
                        {
                            '$?': [
                                {
                                    $gt: [
                                        {$field: endDate},
                                        {$field: 'close_ts'}
                                    ]
                                },
                                {$field: 'close_ts'},
                                {$field: endDate}
                            ]
                        },
                        {
                            '$?': [
                                {
                                    $gt: [
                                        {$field: 'ts'},
                                        {$field: startDate}
                                    ]
                                },
                                {$field: 'ts'},
                                {$field: startDate}
                            ]
                        }
                    ]
                }
            ]
        },
        alias: 'duration_se',
        label: 'Duration by Report'
    };
}

function durationEIField(values) {
    return {
        expr: {
            '$duration': values.map(e => `[${toDateTime(e.start)},${toDateTime(e.end)}]`)
        },
        alias: 'duration_ei',
        label: 'EI Duration'
    };
}

function durationByZebra(reportRange: any[], filters: Filter[]) {
    return durationEIField(makeIntervals(reportRange, filters));
}

function makeIntervals(reportRange, filters) {
    return filters
        .filter(element => !element.condition.match(/periodic/))
        // ToDo check interval is in range report, may be DB cut - test
        .map(element => {
            const values = element.values[0].value.split('-');
            return {
                start: d3.time.format('%d.%m.%Y %H:%M').parse(values[0]),
                end: d3.time.format('%d.%m.%Y %H:%M').parse(values[1])
            };
        }).concat(
            _.flatMap(
                filters
                    .filter(element => element.condition.match(/periodic/))
                    .map(element => generateIntervals(reportRange, element.values[0].value))))
        .sort((a, b) => {
            return a.start.getTime() - b.start.getTime();
        })
        .reduce((acc, curr, currIndex) => { // join interval
            if (currIndex) {
                if (acc[acc.length - 1].end.getTime() === curr.start.getTime()) {
                    acc[acc.length - 1].end = curr.end;
                    return acc;
                }
            }
            return acc.concat({start: curr.start, end: curr.end});
        }, []);
}

// from BI version 1
// function checkDurationIntervals: (values) {
//     return _makeIntervals(values).reduce(function(acc, curr, index, arr) {      // search error
//         if(index && arr[index - 1].end > curr.start) {                          // check end prev and start curr
//             return acc.concat([[
//                 arr[index - 1].start.toString() + ' - ' + arr[index - 1].end.toString(),
//                 curr.start.toString() + ' - ' + curr.end.toString()
//             ]]);
//         }
//         return acc;
//     }, []);
// }

function generateIntervals(reportRange, interval) {
    const start = reportRange[0];
    const end = reportRange[1];
    const from = interval.split('-')[0].split(':');
    const to = interval.split('-')[1].split(':');
    const result = [];
    let nextFirst = new Date(start.getFullYear(), start.getMonth(), start.getDate(), Number(from[0]), Number(from[1]));

    if (nextFirst > start) {
        result.push({
            start: nextFirst,
            end: new Date(nextFirst.getFullYear(), nextFirst.getMonth(), nextFirst.getDate(), Number(to[0]), Number(to[1]))
        });
    } else {
        let secondFirst = new Date(start.getFullYear(), start.getMonth(), start.getDate(), Number(to[0]), Number(to[1]));
        if (secondFirst > start) {
            result.push({
                start: start,
                end: secondFirst
            });
        }
    }

    do {
        nextFirst = new Date(nextFirst.getTime() + 86400000);
        const second = new Date(nextFirst.getFullYear(), nextFirst.getMonth(), nextFirst.getDate(), Number(to[0]), Number(to[1]));
        if (nextFirst > end) {
            break;
        }
        result.push({
            start: nextFirst,
            end: second < end ? second : end
        });
    } while (true);

    return result;
}

function reportRange(group: Group): any[] {
    return [group.filters[0].values[0].value, group.filters[0].values[1].value];
}

function toDateTime(value) {
    return `toDateTime('${d3.time.format('%Y-%m-%dT%H:%M:%S')(value)}')`;
}
