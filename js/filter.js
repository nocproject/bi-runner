var NocFilter = (function() {
    // private var
    var widgets = [];
    var filter = {};

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

    function interval(name, value, type) {
        var from, to;

        if('Date' === type) {
            from = toDate(value[0]);
            to = toDate(value[1]);
        } else if('DateTime' === type) {
            from = toDateTime(value[0]);
            to = toDateTime(value[1]);
        } else {
            from = value[0];
            to = value[1];
        }
        if(value) {
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
                    name = name.split('.')[0];
                    if('interval' === key.condition) {
                        return interval(name, key.values, key.type);
                    }
                    if('periodic.interval' === key.condition) {
                        var hours = key.values.map(function(value) {
                            return value.split(':')[0]
                        });
                        var minutes = key.values.map(function(value) {
                            return value.split(':')[1]
                        });

                        return andValues(flat([interval('toHour(' + name + ')', hours, 'periodic'), interval('toMinute(' + name + ')', minutes, 'periodic')]));
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
            if('widgets' in args) widgets = args.widgets;
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
                        if('string' === typeof value) {
                            if('UInt64' === type) {
                                return Number(value.split('.')[0]);
                            }
                            return value.split('.')[0];
                        } else {
                            return value;
                        }
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
            this.updateFilter('startDate', 'Date', [interval], 'interval');
        },
        getFilter: function() {
            return filter;
        }
    };
})();