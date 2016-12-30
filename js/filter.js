var NocFilter = (function() {
    // private var
    var widgets = [];
    var filter = {};

    // private methods for make filter Object
    function eqValue(name, value) {
        return {
            $eq: [{
                $field: name
            }, {
                $field: value
            }]
        };
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
            flat(keys.map(function(key) {
                    if('date' === key || 'startCondition' === key) {
                        return dateInterval(filter[key]);
                    } else {
                        var values = filter[key].map(function(element) {
                            return eqValue(key, element);
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
        updateFilter: function(fieldName, fieldValues) {
            if('date' === fieldName || 'startCondition' === fieldName) {
                // ToDo compare with startCondition
                filter.date = fieldValues[0];
            } else {
                filter[fieldName] = fieldValues.map(function(element) {
                    return element.split('.')[0];
                });
            }
            updateWidgets(makeFilter());
        },
        getDate: function() {
            if('date' in filter) return filter.date;
            return undefined;
        },
        setStartCondition: function(interval) {
            filter.startCondition = interval;
            dashboard.setSelectorInterval(interval[0], interval[1]);
            this.updateFilter('startCondition', [filter.startCondition]);
        },
        getFilter: function() {
            return filter;
        }
    };
})();