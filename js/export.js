var NocExport = (function() {
    var dashboard;
    var _init = function(board) {
        dashboard = board;
    };

    var _export = function() {
        if(!dashboard.exportQuery) {
            console.warn('export query is null, you must define query into board definition');
            return;
        }

        dashboard.exportQuery.params[0].filter = dashboard.widgets[0].query.params[0].filter;
        const dateInterval = NocFilter.getDateInterval();
        var filename = dashboard.title.replace(/ /g, '_') + '_' + dashboard.dateToString(dateInterval[0], '%Y%m%d')
            + '-' + dashboard.dateToString(dateInterval[1], '%Y%m%d') + '.csv';
        _updateDuration();
        _updateDurationZebra(NocFilterPanel.durationIntervals());
        console.log('file for export : ' + filename);
        $('#export-btn').off('click');

        d3.json('/api/bi/')
        .header("Content-Type", "application/json")
        .post(
            JSON.stringify(dashboard.exportQuery),
            function(error, data) {
                if(error)
                    throw new Error(error);

                if(!('result' in data)) {
                    console.log(data.error);
                    return
                }
                var blob = new Blob([
                    _toCsv(
                        data.result.result,
                        // get description
                        data.result.fields
                        // lookup label from query
                        .map(function(name) {
                            var label = dashboard.exportQuery.params[0].fields
                            .filter(function(e) {
                                return e.expr === name || e.alias === name
                            })[0].label;

                            return label ? label : name;
                        })
                        .map(function(name) {
                            var field = dashboard.fieldsType[name.replace('_text', '')];

                            return field ?
                                field.description ? field.description : name
                                : name
                        }),
                        '"',
                        ';')
                ], {type: "text/plain;charset=utf-8"});
                saveAs(blob, filename);

                $('#export-btn')
                .on('click', function() {
                    _export();
                    $('#export-btn').find('.spinner').show();
                })
                .find('.spinner').hide();
                console.log('export done.');
            })
    };
    /**
     * Converts an array of objects (with identical schemas) into a CSV table.
     * @param {Array} objArray An array of objects.  Each object in the array must have the same property list.
     * @param {Array} nameArray an array names of fields.
     * @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
     * @param {string} cDelimiter The column delimiter.  Defaults to a comma (,) if omitted.
     * @return {string} The CSV equivalent of objArray.
     */
    var _toCsv = function(objArray, nameArray, sDelimiter, cDelimiter) {
        var i, l, names = [], name, value, obj, row, output = '', n, nl;

        function toCsvValue(theValue, sDelimiter) {
            var t = typeof (theValue), output;
            if(typeof (sDelimiter) === 'undefined' || sDelimiter === null) {
                sDelimiter = '"';
            }
            if(t === 'undefined' || t === null) {
                output = '';
            } else if(t === 'string') {
                output = sDelimiter + theValue + sDelimiter;
            } else {
                output = String(theValue);
            }
            return output;
        }

        // Initialize default parameters.
        if(typeof (sDelimiter) === 'undefined' || sDelimiter === null) {
            sDelimiter = '"';
        }
        if(typeof (cDelimiter) === 'undefined' || cDelimiter === null) {
            cDelimiter = ',';
        }
        for(i = 0, l = objArray.length; i < l; i += 1) {
            // Get the names of the properties.
            obj = objArray[i];
            row = '';
            if(i === 0) {
                // Loop through the names
                for(name in nameArray) {
                    if(nameArray.hasOwnProperty(name)) {
                        names.push(name);
                        row += [sDelimiter, nameArray[name], sDelimiter, cDelimiter].join('');
                    }
                }
                row = row.substring(0, row.length - 1);
                output += row;
            }
            output += '\n';
            row = "";
            for(n = 0, nl = names.length; n < nl; n += 1) {
                name = names[n];
                value = obj[name];
                if(n > 0) {
                    row += cDelimiter
                }
                row += toCsvValue(value, '"');
            }
            output += row;
        }
        return output;
    };

    var _updateDurationZebra = function(values) {
        if(Object.getOwnPropertyNames(dashboard.fieldsType).indexOf(dashboard.durationIntervalName) !== -1) {
            var result = _makeIntervals(values);

            _durationFields(result.map(function(element) {
                return [element.start, element.end]
            }));
            return true;
        }
        return false;
    };

    var _updateDuration = function() {
        var dateInterval = NocFilter.getDateInterval();
        var startDate = "toDateTime('" + d3.time.format("%Y-%m-%dT%H:%M:%S")(dateInterval[0]) + "')";
        var endDate = "toDateTime('" + d3.time.format("%Y-%m-%dT%H:%M:%S")(dateInterval[1]) + "')";
        var duration = function() {
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
                label: __('Duration by Report')
            };
        };

        var fields = dashboard.exportQuery.params[0].fields.filter(function(element) {
            return 'duration_se' !== element.alias
        });

        if(Object.getOwnPropertyNames(dashboard.fieldsType).indexOf(dashboard.durationIntervalName) !== -1) {
            fields.push(duration(dateInterval));
        }

        console.log('updating duration field');
        dashboard.exportQuery.params[0].fields = fields;
    };

    var _durationFields = function(values) {
        var field = function(values) {
            return {
                expr: {
                    '$duration': values.map(function(e) {
                        return '[' + dashboard.toDateTime(e[0]) + ',' + dashboard.toDateTime(e[1]) + ']';
                    })
                },
                alias: 'duration_val',
                label: __('EI Duration')
            }
        };
        var fields = dashboard.exportQuery.params[0].fields.filter(function(e) {
            return 'duration_val' !== e.alias
        });

        if(values.length > 0) {
            fields.push(field(values));
        }
        dashboard.exportQuery.params[0].fields = fields;
    };

    var _generateIntervals = function(startEndTotal, startTime, endTime) {
        var start = startEndTotal[0];
        var end = startEndTotal[1];
        var from = startTime.split(':');
        var to = endTime.split(':');
        var nextFirst = new Date(start.getFullYear(), start.getMonth(), start.getDate(), Number(from[0]), Number(from[1]));
        var result = [];

        if(nextFirst > start) {
            result.push({
                start: nextFirst,
                end: new Date(nextFirst.getFullYear(), nextFirst.getMonth(), nextFirst.getDate(), Number(to[0]), Number(to[1]))
            });
        } else {
            var secondFirst = new Date(start.getFullYear(), start.getMonth(), start.getDate(), Number(to[0]), Number(to[1]));
            if(secondFirst > start) {
                result.push({
                    start: start,
                    end: secondFirst
                });
            }
        }

        do {
            nextFirst = new Date(nextFirst.getTime() + 86400000);
            var second = new Date(nextFirst.getFullYear(), nextFirst.getMonth(), nextFirst.getDate(), Number(to[0]), Number(to[1]));
            if(nextFirst > end) {
                break;
            }
            result.push({
                start: nextFirst,
                end: second < end ? second : end
            });
        } while(true);

        return result;
    };

    var _makeIntervals = function(values) {
        return values.filter(function(element) {
            return !element.condition.match(/periodic/);
        })
        .map(function(element) {
            return {start: dashboard.parseDate(element.start, '%Y-%m-%dT%H:%M:00'), end: dashboard.parseDate(element.end, '%Y-%m-%dT%H:%M:00')}
        })
        .concat([].concat.apply([], values.filter(function(element) {
            return element.condition.match(/periodic/);
        })
        .map(function(element) {
            return _generateIntervals(NocFilter.getDateInterval(), element.start, element.end)
        })))
        .sort(function(a, b) {
            return a.start.getTime() - b.start.getTime();
        })
        .reduce(function(acc, curr, currIndex) { // join interval
            if(currIndex) {
                if(acc[acc.length - 1].end.getTime() === curr.start.getTime()) {
                    acc[acc.length - 1].end = curr.end;
                    return acc;
                }
            }
            return acc.concat({start: curr.start, end: curr.end});
        }, []);
    };

    return {
        init: _init,
        export: _export,
        updateDuration: _updateDuration,
        updateDurationZebra: _updateDurationZebra,
        checkDurationIntervals: function(values) {
            return _makeIntervals(values).reduce(function(acc, curr, index, arr) {      // search error
                if(index && arr[index - 1].end > curr.start) {                          // check end prev and start curr
                    return acc.concat([[
                        arr[index - 1].start.toString() + ' - ' + arr[index - 1].end.toString(),
                        curr.start.toString() + ' - ' + curr.end.toString()
                    ]]);
                }
                return acc;
            }, []);
        }
    }
})();