var NocFilter = (function() {
    // private var
    var widgets = [];
    var filter = {};

    // private methods for make filter Object
    function eqValue(name, value) {
        return conditionValue('$eq', name, value);
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

    function orValues(values) {
        return [{
            $or: values
        }];
    }

    function andValues(values) {
        return {
            $and: values
        };
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
                    if('interval' === key.condition) {
                        return interval(name, key.values, key.type);
                    } else {
                        var values = key.values.map(function(value) {
                            return conditionValue(name, value, key.type, key.condition);
                        });
                        if(values.length > 0) {
                            return orValues(values);
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
            if('startCondition' in args) {
                this.setStartCondition(args.startCondition);
            }
        },
        updateFilter: function(name, type, values, condition) {
            filter[name] = {
                values: flat(values.map(function(value) {
                    if('string' === typeof value) {
                        return value.split('.')[0];
                    } else {
                        return value;
                    }
                })),
                type: type,
                condition: condition
            };
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
        setStartCondition: function(interval) {
            filter.date = interval;
            dashboard.setSelectorInterval(interval[0], interval[1]);
            this.updateFilter('date', 'Date', [filter.date], 'interval');
        },
        getFilter: function() {
            return filter;
        }
    };
})();