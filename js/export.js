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
        console.log('file for export : ' + filename);
        $("#export-btn").off("click");

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
                var blob = new Blob([_toCsv(data.result.result, data.result.fields, '"', ';')], {type: "text/plain;charset=utf-8"});
                saveAs(blob, filename);

                $('#export-btn')
                .on("click", "", function() {
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
        var i, l, names = [], name, value, obj, row, output = "", n, nl;

        function toCsvValue(theValue, sDelimiter) {
            var t = typeof (theValue), output;
            if(typeof (sDelimiter) === "undefined" || sDelimiter === null) {
                sDelimiter = '"';
            }
            if(t === "undefined" || t === null) {
                output = "";
            } else if(t === "string") {
                output = sDelimiter + theValue + sDelimiter;
            } else {
                output = String(theValue);
            }
            return output;
        }

        // Initialize default parameters.
        if(typeof (sDelimiter) === "undefined" || sDelimiter === null) {
            sDelimiter = '"';
        }
        if(typeof (cDelimiter) === "undefined" || cDelimiter === null) {
            cDelimiter = ",";
        }
        for(i = 0, l = objArray.length; i < l; i += 1) {
            // Get the names of the properties.
            obj = objArray[i];
            row = "";
            if(i === 0) {
                // Loop through the names
                for(name in nameArray) {
                    if(nameArray.hasOwnProperty(name)) {
                        names.push(name);
                        row += [sDelimiter, nameArray[name], sDelimiter, cDelimiter].join("");
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

    var _updateDurationZebra = function(field) {
        console.log(field);
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
                alias: 'duration'
            };
        };

        if(dashboard.exportQuery.params[0].fields.filter(function(element) {
                return 'duration' === element.alias
            }).length > 0) {
            console.log('updating duration field');
            // sum(((dateInterval[1] > close_ts) ? close_ts : dateInterval[1]) - ((ts > dateInterval[1]) ? ts : dateInterval[1]))
            dashboard.exportQuery.params[0].fields = dashboard.exportQuery.params[0].fields.map(function(element) {
                if(element.hasOwnProperty('alias') && element.alias === 'duration')  return duration(dateInterval);
                return element;
            });
        }
    };

    return {
        init: _init,
        export: _export,
        updateDuration: _updateDuration,
        updateDurationZebra: _updateDurationZebra
    }
})();