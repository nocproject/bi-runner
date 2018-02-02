import { Observable } from 'rxjs/Rx';
import { clone, flatMap, head } from 'lodash';
import * as d3 from 'd3';
import * as saver from 'file-saver';

import { APIService } from '@app/services';
//
import {
    BiRequest,
    BiRequestBuilder,
    Board,
    Field,
    FieldBuilder,
    Filter,
    Group,
    Methods,
    Range,
    Result,
    WhereBuilder
} from '../model';
//
import { BoardResolver } from '../board/services/board.resolver';
import { FilterService } from '../board/services/filter.service';

export class Export {

    static query(api: APIService,
                 boardResolver: BoardResolver,
                 filterService: FilterService): Observable<Result> {
        const board: Board = clone(boardResolver.getBoard());
        const where = WhereBuilder.makeWhere(filterService.allFilters());
        const params = clone(board.exportQry.params);
        const fields = params[0].fields.filter(f => f.alias !== 'duration_se' && f.alias !== 'duration_ei');
        const durationFilters: Filter[] = filterService.allFiltersByName('exclusion_intervals');

        if (durationFilters.length > 0) {
            const rangeGroup = head(filterService.getFilter('startEnd'));
            if (!rangeGroup) {
                return Observable.throw('You must set report range!');
            }
            const range = reportRange(rangeGroup);
            fields.push(durationByReport(range));
            fields.push(durationByZebra(range, durationFilters));
        }

        if (where) {
            params[0].filter = where;
        }
        // ToDo change backend (use boolean) and remove
        params[0].fields = fields.map(field => {
            if (field.hide) {
                field.hide = 'yes';
            }
            return field;
        });
        const query: BiRequest = new BiRequestBuilder()
            .method(Methods.QUERY)
            .params(params)
            .build();
        return api.execute(query);
    }

    static save(data,
                boardResolver: BoardResolver) {
        const fields: Field[] = clone(boardResolver.getBoard().exportQry.params[0].fields);
        const title: string = clone(boardResolver.getBoard().title);
        const pairs = clone(fields
            .map(field => [field.alias ? field.alias : field.expr, field.label]))
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
        saver.saveAs(
            new Blob([toCsv(data.result, data.fields.map(field => pairs[field]), '"', ';')]
                , {type: 'text/plain;charset=utf-8'}), `${title}.csv`
        );
    }
}

function durationByReport(values: any[]) {
    const startDate = toDateTime(values[0]);
    const endDate = toDateTime(values[1]);

    return new FieldBuilder()
        .expr({
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
        })
        .alias('duration_se')
        .label('Duration by Report')
        .build();
    // return {
    //     expr: {
    //         $sum: [
    //             {
    //                 $minus: [
    //                     {
    //                         '$?': [
    //                             {
    //                                 $gt: [
    //                                     {$field: endDate},
    //                                     {$field: 'close_ts'}
    //                                 ]
    //                             },
    //                             {$field: 'close_ts'},
    //                             {$field: endDate}
    //                         ]
    //                     },
    //                     {
    //                         '$?': [
    //                             {
    //                                 $gt: [
    //                                     {$field: 'ts'},
    //                                     {$field: startDate}
    //                                 ]
    //                             },
    //                             {$field: 'ts'},
    //                             {$field: startDate}
    //                         ]
    //                     }
    //                 ]
    //             }
    //         ]
    //     },
    //     alias: 'duration_se',
    //     label: 'Duration by Report'
    // };
}

function durationEIField(values): Field {
    return new FieldBuilder()
        .alias('duration_ei')
        .label('EI Duration')
        .expr({
            '$duration': values.map(e => `[${toDateTime(e.start)},${toDateTime(e.end)}]`)
        })
        .build();
    // expr: {
    //     '$duration': values.map(e => `[${toDateTime(e.start)},${toDateTime(e.end)}]`)
    // },
    // alias: 'duration_ei',
    // label: 'EI Duration'
}

function durationByZebra(reportRange: any[], filters: Filter[]) {
    return durationEIField(makeIntervals(reportRange, filters));
}

function makeIntervals(reportRange, filters) {
    return filters
        .filter(element => !element.condition.match(/periodic/))
        // ToDo check interval is in range report, may be DB cut - test
        .map(element => {
            return {
                start: element.values[0].value,
                end: element.values[1].value
            };
        }).concat(
            flatMap(
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
    const from = interval.split(' - ')[0].split(':');
    const to = interval.split(' - ')[1].split(':');
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
    if (group.filters[0].values.length > 1) {
        return [group.filters[0].values[0].value, group.filters[0].values[1].value];
    }
    const dates = Range.getDates(group.filters[0].values[0].value);
    return [dates.from, dates.to];
}

function toDateTime(value) {
    return `toDateTime('${d3.time.format('%Y-%m-%dT%H:%M:%S')(value)}')`;
}

/**
 * Converts an array of objects (with identical schemas) into a CSV table.
 * @param {Array} objArray An array of objects.  Each object in the array must have the same property list.
 * @param {Array} nameArray an array names of fields.
 * @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
 * @param {string} cDelimiter The column delimiter.  Defaults to a comma (,) if omitted.
 * @return {string} The CSV equivalent of objArray.
 */
function toCsv(objArray, nameArray, sDelimiter, cDelimiter) {
    let i, l, names = [], name, value, obj, row, output = '', n, nl;

    function toCsvValue(theValue, sDelimiter) {
        let t = typeof (theValue), output;
        if (typeof (sDelimiter) === 'undefined' || sDelimiter === null) {
            sDelimiter = '"';
        }
        if (t === 'undefined' || t === null) {
            output = '';
        } else if (t === 'string') {
            output = sDelimiter + theValue + sDelimiter;
        } else {
            output = String(theValue);
        }
        return output;
    }

    // Initialize default parameters.
    if (typeof (sDelimiter) === 'undefined' || sDelimiter === null) {
        sDelimiter = '"';
    }
    if (typeof (cDelimiter) === 'undefined' || cDelimiter === null) {
        cDelimiter = ',';
    }
    for (i = 0, l = objArray.length; i < l; i += 1) {
        // Get the names of the properties.
        obj = objArray[i];
        row = '';
        if (i === 0) {
            // Loop through the names
            for (name in nameArray) {
                if (nameArray.hasOwnProperty(name)) {
                    names.push(name);
                    row += [sDelimiter, nameArray[name], sDelimiter, cDelimiter].join('');
                }
            }
            row = row.substring(0, row.length - 1);
            output += row;
        }
        output += '\n';
        row = '';
        for (n = 0, nl = names.length; n < nl; n += 1) {
            name = names[n];
            value = obj[name];
            if (n > 0) {
                row += cDelimiter;
            }
            row += toCsvValue(value, '"');
        }
        output += row;
    }
    return output;
}
