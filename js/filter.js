var NocFilter = (function() {
    // private var
    var widgets = [];
    var filter = {};

    // private methods for make filter Object
    function eqValue(name, value) {
        return conditionValue('$eq', name, value);
    }

    function conditionValue(condition, name, value) {
        var expression = {};

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

    function dateInterval(value) {
        if(value) {
            return [{
                $gte: [{
                    $field: "date"
                }, {
                    $field: "toDate('" + d3.time.format("%Y-%m-%d")(value[0]) + "')"
                }]
            }, {
                $lte: [{
                    $field: "date"
                }, {
                    $field: "toDate('" + d3.time.format("%Y-%m-%d")(value[1]) + "')"
                }]
            }];
        } else {
            return [];
        }
    }

    function dateTimeInterval(value) {
        if(value) {
            return [{
                $gte: [{
                    $field: "date"
                }, {
                    $field: "toDateTime('" + d3.time.format("%Y-%m-%dT%H:%M:%S")(value[0]) + "')"
                }]
            }, {
                $lte: [{
                    $field: "date"
                }, {
                    $field: "toDateTime('" + d3.time.format("%Y-%m-%dT%H:%M:%S")(value[1]) + "')"
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

    function makeFilter(condition) {
        var keys = Object.getOwnPropertyNames(filter);

        return andValues(
            flat(keys.map(function(key) {
                    if('date' === key && 'interval' === condition) {
                        return dateInterval(filter[key]);
                    } else {
                        var values = filter[key].map(function(element) {
                            return conditionValue(condition, key, element);
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
            console.warn('updateFilter : ', name, type, values, condition);
            if('date' === name || 'interval' === condition) {
                // ToDo compare with startCondition
                filter.date = values[0];
            } else {
                filter[name] = values.map(function(element) {
                    return element.split('.')[0];
                });
            }
            updateWidgets(makeFilter(condition));
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