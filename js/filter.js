var NocFilter = (function() {
    // private var
    var widgets = [];
    var filter = {};
    var fieldNameSeparator;

    // private methods for make filter Object
    function eqValue(name, value) {
        return conditionValue(name, value, null, '$eq');
    }

    function ipv4StrToNum(value) {
        return "IPv4StringToNum('" + value + "')";
    }

    function conditionValue(name, values, type, condition) {

        if('interval' === condition) {
            return interval(name, values, type);
        } else if('periodic.interval' === condition) {
            values = values.map(function(value) {
                return toSeconds(value)
            });
            return interval('toInt32(toTime(' + name + '))', values, 'periodic');
        } else if('not.periodic.interval' === condition) {
            values = values.map(function(value) {
                return toSeconds(value)
            });
            return not(interval('toInt32(toTime(' + name + '))', values, 'periodic'));
        } else if('not.interval' === condition) {
            return not(interval(name, values, type));
        } else if('in' === condition) {
            return inCondition(name, values, type);
        } else if('not.in' === condition) {
            return not(inCondition(name, values, type));
        } else if('in.or' === condition) {
            return inToOr(name, values, type);
        } else if('empty' === condition) {
            return empty(name);
        } else if('not.empty' === condition) {
            return notEmpty(name);
        } else {
            var expression = {};

            if('Date' === type) {
                values = {
                    $field: dashboard.toDate(values[0])
                };
            } else if('DateTime' === type) {
                values = {
                    $field: dashboard.toDateTime(values[0])
                };
            } else if('IPv4' === type) {
                values = {
                    $field: ipv4StrToNum(values)
                };
            } else if('String' === type) {
                values = values[0];
            } else if(type && (!type.indexOf('tree-') || !type.indexOf('dict-') || type.match(/int|float/i))) {
                values = {
                    $field: values
                };
            }

            if(condition) {
                expression[condition] = [{
                    $field: name
                }, values];
                return expression;
            }

            return eqValue(name, values);
        }
    }

    function not(value) {
        return {
            $not: value
        };
    }

    function empty(value) {
        return {
            "$empty": {
                "$field": value
            }
        };

    }

    function notEmpty(value) {
        return {
            "$notEmpty": {
                "$field": value
            }
        };
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

    function inCondition(name, values, type) {
        if(values) {
            return {
                $in: [
                    {
                        $field: name
                    },
                    flat(values.map(function(value) {
                        if(!type.indexOf('tree-') || !type.indexOf('dict-') || type.match(/int|float/i)) {
                            return Number(value);
                        }
                        return value;
                    }))
                ]
            }
        }
    }

    function inToOr(name, values, type) {
        return orValuesArray(values.map(function(value) {
            return orValues(conditionValue(name, '' + value, type, '$eq'));
        }))
    }

    function interval(name, values, type) {
        var from, to;

        if('Date' === type) {
            from = dashboard.toDate(values[0]);
            to = dashboard.toDate(values[1]);
        } else if('DateTime' === type) {
            from = dashboard.toDateTime(values[0]);
            to = dashboard.toDateTime(values[1]);
        } else if('IPv4' === type) {
            from = ipv4StrToNum(values[0]);
            to = ipv4StrToNum(values[1]);
        } else {
            from = values[0];
            to = values[1];
        }
        if('String' === type) {
            return {
                $between: [{
                    $field: name
                }, from, to
                ]
            };
        }
        return {
            $between: [{
                $field: name
            }, {
                $field: from
            }, {
                $field: to
            }]
        };

    }

    function flat(values) {
        return [].concat.apply([], values);
    }

    function updateWidgets(queryFilter) {
        widgets.map(function(widget) {
            // console.log(JSON.stringify(queryFilter));
            setFilter(widget, queryFilter);
        });
    }

    function setFilter(widget, filter) {
        widget.query.params[0].filter = filter;
    }

    function toSeconds(param) {
        return Number(param.split(':')[0]) * 3600 + Number(param.split(':')[1]) * 60 + 86400
    }

    function makeFilter() {
        var keys = Object.getOwnPropertyNames(filter);

        return andValues(
            flat(keys.map(function(name) {
                    var key = filter[name];

                    if('startDate' === name) name = 'date';
                    name = name.split(fieldNameSeparator)[0];
                    if('orForAnd' === key.condition) {
                        return orValues(key.values.map(function(v) {
                            return conditionValue(v.name, v.values, v.type, v.condition);
                        }));
                    } else {
                        return conditionValue(name, key.values, key.type, key.condition);
                    }
                })
            )
        );
    }

    function restoreFilter(savedFilter) {
        var convert = function(name, field) {
            var values = field.values.map(function(val) {
                if(!field.type.indexOf('Date') && !field.condition.match(/periodic/i)) {
                    return new Date(Date.parse(val));
                }
                return val;
            });

            if('startDate' === name) {
                dashboard.setSelectorInterval(values[0], values[1]);
                return {
                    values: values,
                    type: 'Date',
                    condition: 'interval'
                }
            }

            return {
                name: (field.name) ? field.name : name,
                values: values,
                type: field.type,
                condition: field.condition
            }
        };

        if(savedFilter) {
            Object.getOwnPropertyNames(savedFilter).map(function(name) {
                if(name.split(fieldNameSeparator).length < 3) {
                    if('orForAnd' === savedFilter[name].condition) {
                        filter[name] = {
                            values: savedFilter[name].values.map(function(val) {
                                return convert(name, val);
                            }),
                            condition: 'orForAnd'
                        }
                    } else {
                        filter[name] = convert(name, savedFilter[name]);
                    }
                }
            });

            updateWidgets(makeFilter());
        }
    }

    // public
    return {
        init: function(args) {
            if(args.hasOwnProperty('fieldNameSeparator')) fieldNameSeparator = args.fieldNameSeparator;
            if(args.hasOwnProperty('widgets')) widgets = args.widgets;
            if(args.hasOwnProperty('filter')) restoreFilter(args.filter);
        },
        updateFilter: function(name, type, values, condition) {
            if(!values || values.length === 0) {
                this.deleteFilter(name);
            } else {
                if('orForAnd' === condition) {
                    filter[name] = {
                        values: values,
                        condition: condition
                    }
                } else {
                    filter[name] = {
                        values: flat(values.map(function(value) {
                            return value.id;
                        })),
                        type: type,
                        condition: condition
                    };
                }
            }
            updateWidgets(makeFilter());
        },
        deleteFilter: function(name) {
            if(filter.hasOwnProperty(name)) {
                delete filter[name];
                updateWidgets(makeFilter());
            }
        },
        getDateInterval: function() {
            var keys = Object.getOwnPropertyNames(filter);
            var dates = keys.filter(function(name) {
                return 'startDate' === name || !name.indexOf('date');
            }).map(function(name) {
                return filter[name];
            });

            var minDate = Math.max.apply(Math,
                dates
                .map(function(element) {
                    return element.values[0];
                }));

            var maxDate = Math.min.apply(Math,
                dates
                .map(function(element) {
                    return element.values[1];
                }));

            return [new Date(minDate), new Date(maxDate)];

        },
        getDate: function() {
            if('date' in filter) return filter.date;
            return undefined;
        },
        setStartDateCondition: function(interval) {
            dashboard.setSelectorInterval(interval[0], interval[1]);
            this.updateFilter('startDate', 'Date', [{id: interval[0]}, {id: interval[1]}], 'interval');
        },
        getFilter: function(name) {
            if(name) {
                return filter[name];
            }
            return filter;
        },
        getByCellName: function(name) {
            var key = Object.getOwnPropertyNames(filter).filter(function(element) {
                var tags = element.split(fieldNameSeparator);
                return name === tags[1] && tags.length > 2;
            })[0];
            return filter[key];
        }
    };
})();