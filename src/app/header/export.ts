import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import * as d3 from 'd3';

import { APIService, FilterService } from '../services';
import { Board, Field, Group, Methods, QueryBuilder, Query, Result, WhereBuilder } from '../model';

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
            fields: [
                {
                    expr: `uniq(${fields})`,
                    alias: 'qty'
                }
            ]
        };

        console.log(groups.filter(field => field.hasOwnProperty('group')));
        console.log(durationByReport(_.first(filterService.getFilter('startEnd'))));

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

function durationByReport(group: Group) {
    const startDate = `toDateTime('${d3.time.format('%Y-%m-%dT%H:%M:%S')(group.filters[0].values[0].value)}')`;
    const endDate = `toDateTime('${d3.time.format('%Y-%m-%dT%H:%M:%S')(group.filters[0].values[1].value)}')`;

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

// function updateDurationZebra(values) {
//     // check exist duration_intervals field
//     if (Object.getOwnPropertyNames(dashboard.fieldsType).indexOf(dashboard.durationIntervalName) !== -1) {
//         var result = makeIntervals(values);
//
//         durationFields(result.map(function (element) {
//             return [element.start, element.end];
//         }));
//         return true;
//     }
//     return false;
// }
//
// function makeIntervals(values) {
//     return values.filter(element => !element.condition.match(/periodic/))
//         .map(element => {
//             return {
//                 start: d3.time.format('%Y-%m-%dT%H:%M:00').parse(element.start),
//                 end: d3.time.format('%Y-%m-%dT%H:%M:00').parse(element.end)
//             };
//         })
//         .concat([].concat.apply([], values.filter(function (element) {
//             return element.condition.match(/periodic/);
//         })
//             .map(function (element) {
//                 return generateIntervals(NocFilter.getDateInterval(), element.start, element.end);
//             })))
//         .sort(function (a, b) {
//             return a.start.getTime() - b.start.getTime();
//         })
//         .reduce(function (acc, curr, currIndex) { // join interval
//             if (currIndex) {
//                 if (acc[acc.length - 1].end.getTime() === curr.start.getTime()) {
//                     acc[acc.length - 1].end = curr.end;
//                     return acc;
//                 }
//             }
//             return acc.concat({start: curr.start, end: curr.end});
//         }, []);
// }
//
// function generateIntervals(startEndTotal, startTime, endTime) {
//     var start = startEndTotal[0];
//     var end = startEndTotal[1];
//     var from = startTime.split(':');
//     var to = endTime.split(':');
//     var nextFirst = new Date(start.getFullYear(), start.getMonth(), start.getDate(), Number(from[0]), Number(from[1]));
//     var result = [];
//
//     if (nextFirst > start) {
//         result.push({
//             start: nextFirst,
//             end: new Date(nextFirst.getFullYear(), nextFirst.getMonth(), nextFirst.getDate(), Number(to[0]), Number(to[1]))
//         });
//     } else {
//         var secondFirst = new Date(start.getFullYear(), start.getMonth(), start.getDate(), Number(to[0]), Number(to[1]));
//         if (secondFirst > start) {
//             result.push({
//                 start: start,
//                 end: secondFirst
//             });
//         }
//     }
//
//     do {
//         nextFirst = new Date(nextFirst.getTime() + 86400000);
//         var second = new Date(nextFirst.getFullYear(), nextFirst.getMonth(), nextFirst.getDate(), Number(to[0]), Number(to[1]));
//         if (nextFirst > end) {
//             break;
//         }
//         result.push({
//             start: nextFirst,
//             end: second < end ? second : end
//         });
//     } while (true);
//
//     return result;
// }
//
// function durationFields(values) {
//     var field = function (values) {
//         return {
//             expr: {
//                 '$duration': values.map(function (e) {
//                     return `[${toDateTime(e[0])},${toDateTime(e[1])}]`;
//                 })
//             },
//             alias: 'duration_val',
//             label: 'EI Duration'
//         };
//     };
//     var fields = dashboard.exportQuery.params[0].fields.filter(function (e) {
//         return 'duration_val' !== e.alias;
//     });
//
//     fields.push(field(values));
//     dashboard.exportQuery.params[0].fields = fields;
// }
//
// function toDateTime(value) {
//     return `toDateTime('${d3.time.format('%Y-%m-%dT%H:%M:%S')(value)}')`;
// }
