var NocFilter = (function() {
    // private var
    var widgets = [];
    var filter = {};
    var fiedlNameSeparator;

    // private methods for make filter Object
    function eqValue(name, value) {
        return conditionValue(name, value, null, '$eq');
    }

    function conditionValue(name, value, type, condition) {
        var expression = {};

        if('Date' === type) {
            value = toDate(value);
        } else if('DateTime' === type) {
            value = toDateTime(value);
        } else if('IPv4' === type) {
            value = "IPv4StringToNum('" + value + "')";
        }

        if(condition) {
            expression[condition] = [{
                $field: name
            }, {
                $field: value
            }];
            return expression;
        }

        return eqValue(name, value);
    }

    function orValuesArray(values) {
        return [{
            $or: values
        }];
    }

    function orValues(values) {
        return {
            $or: values
        };
    }

    function andValues(values) {
        return {
            $and: values
        };
    }

    function inCondition(name, value, type) {
        if(value) {
            return [{
                $in: [
                    {
                        $field: name
                    },
                    value
                ]
            }]
        }
    }

    function inToOr(name, values) {
        return orValuesArray(values.map(function(value) {
            return orValues(eqValue(name, "" + value));
        }))
    }

    function interval(name, values, type) {
        var from, to;

        if('Date' === type) {
            from = toDate(values[0]);
            to = toDate(values[1]);
        } else if('DateTime' === type) {
            from = toDateTime(values[0]);
            to = toDateTime(values[1]);
        } else if('IPv4' === type) {
            from = "IPv4StringToNum('" + values[0] + "')";
            to = "IPv4StringToNum('" + values[1] + "')";
        } else {
            from = values[0];
            to = values[1];
        }
        if(values.length === 2) {
            return [{
                $gte: [{
                    $field: name
                }, {
                    $field: from
                }]
            }, {
                $lte: [{
                    $field: name
                }, {
                    $field: to
                }]
            }];
        } else {
            return [];
        }
    }

    function flat(values) {
        return [].concat.apply([], values);
    }

    function updateWidgets(queryFilter) {
        widgets.map(function(widget) {
            // console.log(JSON.stringify(queryFilter));
            // ToDo
            setFilter(widget, queryFilter);
        });
    }

    function setFilter(widget, filter) {
        widget.query.params[0].filter = filter;
    }

    function makeFilter() {
        var keys = Object.getOwnPropertyNames(filter);

        return andValues(
            flat(keys.map(function(name) {
                    var key = filter[name];

                    if('startDate' === name) name = 'date';
                    name = name.split(fiedlNameSeparator)[0];
                    if('interval' === key.condition) {
                        return interval(name, key.values, key.type);
                    }
                    if('periodic.interval' === key.condition) {
                        var toSeconds = function(param) {
                            return Number(param.split(':')[0]) * 3600 + Number(param.split(':')[1]) * 60 + 86400
                        };
                        var values = key.values.map(function(value) {
                            return toSeconds(value)
                        });

                        return andValues(flat(interval('toInt32(toTime(' + name + '))', values, 'periodic')));
                    }
                    if('in' === key.condition) {
                        return inCondition(name, key.values, key.type);
                    }
                    if('in.or' === key.condition) {
                        return inToOr(name, key.values);
                    } else {
                        var values = key.values.map(function(value) {
                            return conditionValue(name, value, key.type, key.condition);
                        });
                        if(values.length > 0) {
                            return orValuesArray(values);
                        } else {
                            return [];
                        }
                    }
                })
            )
        );
    }

    function toDate(value) {
        return "toDate('" + d3.time.format("%Y-%m-%d")(value) + "')";
    }

    function toDateTime(value) {
        return "toDateTime('" + d3.time.format("%Y-%m-%dT%H:%M:%S")(value) + "')";
    }

    // public
    return {
        init: function(args) {
            filter = {};
            if(args.hasOwnProperty('fiedlNameSeparator')) fiedlNameSeparator = args.fiedlNameSeparator;
            if(args.hasOwnProperty('widgets')) widgets = args.widgets;
            if(args.hasOwnProperty('startDateCondition')) {
                this.setStartDateCondition(args.startDateCondition);
            }
        },
        updateFilter: function(name, type, values, condition) {
            if(!values || values.length === 0) {
                this.deleteFilter(name);
            } else {
                filter[name] = {
                    values: flat(values.map(function(value) {
                        if('UInt64' === type) return Number(value.id);
                        return value.id;
                    })),
                    type: type,
                    condition: condition
                };
            }
            updateWidgets(makeFilter());
        },
        deleteFilter: function(name) {
            if(filter.hasOwnProperty(name)) {
                delete filter[name];
                updateWidgets(makeFilter());
            }
        },
        getDate: function() {
            if('date' in filter) return filter.date;
            return undefined;
        },
        setStartDateCondition: function(interval) {
            dashboard.setSelectorInterval(interval[0], interval[1]);
            this.updateFilter('startDate', 'Date', [{id: interval[0]}, {id: interval[1]}], 'interval');
        },
        getFilter: function() {
            return filter;
        }
    };
})();