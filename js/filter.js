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
                values = Number(values);
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

    function orValues(values) {
        if(values.length > 0) {
            return {
                $or: values
            };
        }
    }

    function andValues(values) {
        return {
            $and: values
        };
    }

    function inCondition(name, values, type) {
        if(values.length > 1) {
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
        } else {
            return conditionValue(name, values[0], type, '$eq');
        }
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

                    if('startDate' === name) name = 'ts';
                    name = name.split(fieldNameSeparator)[0];
                    if('orForAnd' === key.condition) {
                        return orValues(key.values
                        .map(function(v) {
                            var name = v.name;
                            var condition = v.condition;

                            if(dashboard.durationIntervalName === v.name) {
                                name = 'ts';
                                condition = 'not.' + v.condition;
                            }

                            return conditionValue(name, v.values, v.type, condition);
                        }));
                    } else {
                        return conditionValue(name, key.values, key.type, key.condition);
                    }
                })
                .filter(function(v) {
                    return v;
                })
            )
        );
    }

    function valuesToDate(values) {
        return values.map(function(e) {
            return {
                condition: e.condition,
                name: e.name,
                type: e.type,
                values: [new Date(e.values[0]), new Date(e.values[1])]
            }
        })
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
                    type: 'DateTime',
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
            if(savedFilter.hasOwnProperty('startDate')) {
                filter['startDate'] = convert('startDate', savedFilter['startDate']);
            }
            Object.getOwnPropertyNames(savedFilter).map(function(name) {
                // if(dashboard.durationIntervalName === savedFilter[name].values[0].name) {
                //     NocExport.updateDurationZebra(valuesToDate(savedFilter[name].values));
                // }
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
                } else {
                    var n = name.replace('.sav', '');

                    filter[n] = convert(n, savedFilter[name]);
                }
            });

            updateWidgets(makeFilter());
            dashboard.setPikaBounds();
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
            return filter['startDate'].values;
        },
        getDate: function() {
            if('date' in filter) return filter.date;
            return undefined;
        },
        setStartDateCondition: function(interval) {
            dashboard.setSelectorInterval(interval[0], interval[1]);
            this.updateFilter('startDate', 'DateTime', [{id: interval[0]}, {id: interval[1]}], 'interval');
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
        },
        getDurationIntervals: function() {
            var key = Object.getOwnPropertyNames(filter).filter(function(name) {
                return dashboard.durationIntervalName === filter[name].values[0].name
            });

            if(key.length > 0) {
                return filter[key[0]].values;
            }

            return undefined;
        }
    };
})();