var NocFilterPanel = (function() {
    // private var
    var dashboard;

    var _init = function(board) {
        dashboard = board;

        $("#fields")
        .select2(_selectConfig())
        .on('change', function() {
            var id = new Date().getTime();

            console.log("changed  to : ", $(this).val());
            if($(this).val()) {
                _createPanel(id, _parseFieldValue($(this)));
                $(this).val(null).trigger('change');
            }
        })
        .val(null).trigger('change');

        $('.periodic').mask('00:00');
        $('.ipv4').mask('099.099.099.099');
    };

    var determinateType = function(name, field) {

        if(field.dict) {
            if('administrative_domain' === name) {
                return 'tree-' + field.dict;
            }
            return 'dict-' + field.dict;
        }

        if('UInt32' === field.type && 'ip' === name) {
            return 'IPv4';
        }

        return field.type;
    };

    var _selectConfig = function() {
        return {
            theme: 'bootstrap',
            placeholder: 'Select a field',
            minimumResultsForSearch: Infinity,
            dropdownAutoWidth: true,
            width: 'auto',
            templateResult: function(field) {
                if(!field.id) {
                    return field.text;
                }
                var e = field.text.split(',');
                return $('<div class="title-left">' + e[0] + ' : </div><div class="title-right">'
                    + e[1] + '</div><div style="clear:both;"></div>');
            },
            templateSelection: function(data) {
                return data.text.split(',')[0];
            },
            data: Object.getOwnPropertyNames(dashboard.fieldsType).map(function(name) {
                var field = dashboard.fieldsType[name];
                var text = field.description ? field.description : name;
                var type = determinateType(name, field);

                return {
                    id: [name, type, field.dict].filter(function(e) {
                        return e
                    }).join(','),
                    text: text + "," + type
                }
            })
        }
    };

    var _valuesListQuery = function(field, dict, filterPattern) {
        var query = {
            params: [
                {
                    fields: [
                        {
                            expr: field,
                            group: 0
                        },
                        {
                            expr: {
                                $lookup: [
                                    dict,
                                    {
                                        $field: field
                                    }
                                ]
                            },
                            alias: "value",
                            order: 0
                        }
                    ],
                    limit: 500,
                    datasource: dashboard.datasource
                }
            ],
            id: 0,
            method: "query"
        };
        if(filterPattern) {
            query.params[0].filter = {
                $like: [
                    {
                        $lower: {
                            $field: "value"
                        }
                    },
                    {
                        $lower: '%' + filterPattern + '%'
                    }
                ]
            }
        }
        return query
    };

    var _textByIdQuery = function(dict, id) {
        return {
            params: [
                {
                    fields: [
                        {
                            expr: {
                                $lookup: [
                                    dict,
                                    {
                                        $field: 'toUInt64(' + id + ')'
                                    }
                                ]
                            },
                            alias: "value",
                            group: "0"
                        }
                    ],
                    datasource: dashboard.datasource
                }
            ],
            id: 0,
            method: "query"
        }
    };

    var _getTreeQuery = function(datasource, field_name, dict_name) {
        return {
            "params": [
                {
                    "datasource": datasource,
                    "field_name": field_name,
                    "dic_name": dict_name
                }
            ],
            "id": "0",
            "method": "get_hierarchy"
        }
    };

    var _parseFieldValue = function(element) {
        var value = element.val().split(',');

        return {
            name: value[0],
            type: value[1],
            dict: value[2],
            description: element.find(':selected').text().split(',')[0]
        }
    };

    var _createPanel = function(id, field) {
        var filterPanel = {gulp_inject: './templates/filter-panel.html'};
        var typeText = 'type: <b>' + field.type + '</b>';
        var $panel;

        if(!field.type.indexOf('dict-') || !field.type.indexOf('tree-')) {
            typeText = 'dictionary: <b>' + field.dict + '</b>';
        }

        filterPanel = filterPanel.replace(/{name}/g, field.name);
        filterPanel = filterPanel.replace(/{description}/g, field.description);
        filterPanel = filterPanel.replace(/{type}/g, typeText);

        $panel = $(filterPanel);
        $('.filters-by-field').append($panel);
        _addRow(id, field, $panel);

        $panel.find('.apply-filter')
        .on('click', function() {
            var values = [];

            console.log('press apply');
            $panel.find('.first-value').each(function() {
                var element = $(this).find('.values');
                var condition = $(this).parent().find('.condition').val();
                var name = element.attr('name');
                var value = element.val();
                var type = determinateType(name, dashboard.fieldsType[name]);
                var pattern;

                console.log('condition : ' + condition + ',' + name + '=' + value);

                _validate(this, type, condition);

                if('in' === condition || 'not.in' === condition) {
                    value = value.split(',');
                } else if(condition.match(/interval/i)) {
                    value = [value, $(this).parent().next().find('.values').val()];
                } else {
                    value = [value];
                }

                if(!type.indexOf('Date') && !condition.match(/periodic/i)) {
                    if('DateTime' === type) {
                        pattern = '%Y-%m-%dT%H:%M:00';
                    } else if('Date' === type) {
                        pattern = '%Y-%m-%d';
                    }
                    if(pattern) {
                        value = value.map(function(v) {
                            return dashboard.parseDate(v, pattern);
                        });
                    }
                }

                values.push({
                    name: name,
                    values: value,
                    type: type,
                    condition: condition
                });
            });
            if($panel.find('.has-error').size() > 0) return;

            NocFilter.updateFilter(id, field.type, values, 'orForAnd');
            dashboard.drawAll();
            console.log('filter applied');
        });

        $panel.find('.clean-filter')
        .on('click', function() {
            console.log('clean filter');
            console.log('panel id : filter-panel' + id);
            NocFilter.deleteFilter(id);
            dashboard.drawAll();
        });

        $panel.find('.close-panel')
        .on('click', function() {
            console.log(field + ' panel closing...');
            $(this).parents('.panel').remove();
            NocFilter.deleteFilter(id);
            dashboard.drawAll();
        });

        return $panel;
    };

    var _replaceInput = function(field, $row, conditionOptions) {
        if(!field.type.indexOf('dict-')) {
            $row.find('input').first()                      // add 'multiple' attr for multiple select
            .replaceWith('<select name="' + field.name + '" class="form-control values"></select>');

            $row.find('.first-value>div>select')
            .select2({
                theme: 'bootstrap',
                placeholder: 'Select from ' + field.dict,
                dropdownAutoWidth: true,
                width: 'auto',
                // minimumInputLength: 2,
                ajax: {
                    url: '/api/bi/',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    delay: 250,
                    data: function(params) {
                        return JSON.stringify(_valuesListQuery(field.name, field.dict, params.term));
                    },
                    processResults: function(data) {
                        if(data.result) {
                            return {
                                results: data.result.result.map(function(e) {
                                    return {id: e[0], text: e[1]}
                                })
                            };
                        } else {
                            return {
                                results: [{text: data.error}]
                            }
                        }
                    },
                    cache: true
                }
            });
        } else if(!field.type.indexOf('tree-')) {
            $row.find('input').first()                      // add 'multiple' attr for multiple select
            .replaceWith('<select name="' + field.name + '" class="form-control values"></select>');
            // .attr('readonly', 'true');
            $.ajax({
                url: '/api/bi/',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(_getTreeQuery(dashboard.datasource, field.name, field.dict))
            }).then(function(data) {
                if(!data.error) {
                    // <option value="12" parent="1">12</option>
                    console.log('************** : ' + data.result.length);
                    // $row.find('.first-value').find('.values').append(new Option(data.result.result[0], val1, true, true));
                    // $row.find('.first-value').find('.values').trigger('change');
                } else {
                    $row.remove();
                }
            });

            while(conditionOptions.length > 0) {
                conditionOptions.pop();
            }
            conditionOptions.push(
                {id: 'in', text: '=='},
                {id: 'not.in', text: '<>'}
            );
        } else if('DateTime' === field.type) {
            _setDateTimeField($row, field);
            conditionOptions.push(
                {id: 'interval', text: 'interval'},
                {id: 'not.interval', text: 'not into interval'},
                {id: 'periodic.interval', text: 'periodic interval'},
                {id: 'not.periodic.interval', text: 'not into periodic'},
                {id: '$lt', text: '<'},
                {id: '$le', text: '<='},
                {id: '$gt', text: '>'},
                {id: '$ge', text: '>='}
            );
        } else if('Date' === field.type) {
            _setDateField($row, field);
            conditionOptions.push(
                {id: 'interval', text: 'interval'},
                {id: 'not.interval', text: 'not into interval'},
                {id: '$lt', text: '<'},
                {id: '$le', text: '<='},
                {id: '$gt', text: '>'},
                {id: '$ge', text: '>='}
            );
        } else if('IPv4' === field.type) {
            console.log('setting mask for ip, change placeholder to xxx.xxx.xxx.xxx');
            $row.find('input').attr('placeholder', 'xxx.xxx.xxx.xxx').addClass('ipv4');
            conditionOptions.push(
                {id: 'interval', text: 'interval'},
                {id: 'not.interval', text: 'not into interval'},
                {id: '$lt', text: '<'},
                {id: '$gt', text: '>'}
            );
        } else if('String' === field.type) {
            conditionOptions.push(
                {id: 'empty', text: 'empty'},
                {id: 'not.empty', text: 'not empty'},
                {id: '$like', text: 'like'}
            );
        } else {
            conditionOptions.push(
                {id: 'interval', text: 'interval'},
                {id: 'not.interval', text: 'not into interval'},
                {id: '$lt', text: '<'},
                {id: '$le', text: '<='},
                {id: '$gt', text: '>'},
                {id: '$ge', text: '>='}
            );
        }
    };

    var _addRow = function(id, field, $panel, prefix) {
        var rowFilter = {gulp_inject: './templates/filter-row.html'};
        var conditionOptions = [
            {id: '$eq', text: '=='},
            {id: '$ne', text: '<>'}
        ];

        if('inner-' === prefix) {
            rowFilter = {gulp_inject: './templates/filter-row-inner.html'};
        }

        rowFilter = rowFilter.replace(/{name}/g, field.name);
        rowFilter = rowFilter.replace(/{description}/g, field.description);
        rowFilter = rowFilter.replace(/{prefix}/g, prefix);

        const $row = $(rowFilter);
        $panel.find('.filter-rows').append($row);

        if('inner-' !== prefix) {
            $row.find('#inner-fields')
            .select2(_selectConfig())
            .on('change', function() {
                console.log("inner select changed  to : ", $(this).val());
                if($(this).val()) {
                    _addRow(id, _parseFieldValue($(this)), $panel, 'inner-');
                    $(this).val(null).trigger('change');
                }
            })
            .val(null).trigger('change');
        } else {
            $row.find('.hand')
            .on('click', function() {
                console.log('remove inner row');
                $row.remove();
            })
        }

        _replaceInput(field, $row, conditionOptions);

        $row.find('.condition')
        .select2({
            theme: 'bootstrap',
            placeholder: 'Select a condition',
            minimumResultsForSearch: Infinity,
            dropdownAutoWidth: true,
            width: 'auto',
            data: conditionOptions
        });

        $row.find('.condition')
        .on('change', function() {
            var value = $(this).val();

            $row.find('.first-value').addClass('hidden');
            $row.filter('.second-value').addClass('hidden');
            if(!value.match(/empty/i)) {
                $row.find('.first-value').removeClass('hidden');
            }
            if(value.match(/interval/i)) {
                $row.filter('.second-value').removeClass('hidden');
            }
            if('DateTime' === field.type && !value.match(/periodic/i)) {
                _setDateTimeField($row, field);
            } else if('Date' === field.type) {
                _setDateField($row, field);
            }
            if(value.match(/periodic/i)) {
                $row.find('input').replaceWith('<input type="text" class="form-control values periodic" name="' + field.name + '" placeholder="HH:mm">');
            }
            console.log('condition changed to : ' + value);
        });

        if(field.condition) {
            $row.find('.condition').val(field.condition).trigger('change');
        }

        if(field.values) {
            var val1 = field.values[0];
            var val2 = field.values[1];

            if(!field.type.indexOf('dict-')) {
                $.ajax({
                    url: '/api/bi/',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(_textByIdQuery(field.dict, val1))
                }).then(function(data) {
                    if(data.result.result[0]) {
                        $row.find('.first-value').find('.values').append(new Option(data.result.result[0], val1, true, true));
                        $row.find('.first-value').find('.values').trigger('change');
                    } else {
                        $row.remove();
                    }
                });
            }
            if(!field.type.indexOf('tree-')) {
                $row.find('.first-value').find('.values').val(field.values.join(','));
            } else {
                if('DateTime' === field.type && !field.condition.match(/periodic/i)) {
                    val1 = dashboard.dateToString(new Date(Date.parse(val1)), "%Y-%m-%dT%H:%M:%S");
                    val2 = dashboard.dateToString(new Date(Date.parse(val2)), "%Y-%m-%dT%H:%M:%S");
                } else if('Date' === field.type) {
                    val1 = dashboard.dateToString(new Date(Date.parse(val1)), "%Y-%m-%d");
                    val2 = dashboard.dateToString(new Date(Date.parse(val2)), "%Y-%m-%d");
                }

                $row.find('.first-value').find('.values').val(val1).trigger('change');
                $row.filter('.second-value').find('.values').val(val2).trigger('change');
            }
        }
    };

    var _validate = function(firstRow, type, condition) {
        var secondRow = $(firstRow).parent().next();
        var firstValue = $(firstRow).find('.values').val();
        var secondValue = $(secondRow).find('.values').val();
        var toScreen = function(which, message) {
            $(which).find('div>.help-block').remove();
            $(which).addClass('has-error');
            $(which).find('div')
            .append($('<span class="help-block">' + message.join(', ') + '</span>'));
        };
        var showErrors = function(message1, message2) {
            if(message1.length > 0) {
                toScreen(firstRow, message1);
            } else {
                $(firstRow).removeClass('has-error');
                $(firstRow).find('div>.help-block').remove();
            }
            if(message2.length > 0) {
                toScreen(secondRow, message2);
            } else {
                $(secondRow).find('div>.help-block').remove();
                $(secondRow).removeClass('has-error');
            }
        };
        var ipStringToNum = function(str) {
            var d = str.split('.');

            return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
        };

        if(!$(firstRow).hasClass('hidden')) {
            if(!firstValue) {
                showErrors(['empty value'], []);
                return;
            }

            if(!$(secondRow).hasClass('hidden') && !secondValue) {
                showErrors([], ['empty value']);
                return;
            }

            if(condition.match(/periodic/i)) {
                var message1 = [], message2 = [];
                var hourStart, hourEnd, minuteStart, minuteEnd;

                hourStart = Number(firstValue.split(':')[0]);
                if(isNaN(hourStart)) {
                    message1.push('hour is not number');
                }
                hourEnd = Number(secondValue.split(':')[0]);
                if(isNaN(hourEnd)) {
                    message2.push('hour is not number');
                }
                minuteStart = Number(firstValue.split(':')[1]);
                if(isNaN(minuteStart)) {
                    message1.push('minute is not number');
                }
                minuteEnd = Number(secondValue.split(':')[1]);
                if(isNaN(minuteEnd)) {
                    message2.push('minute is not number');
                }

                showErrors(message1, message2);
                if(message1.length !== 0 || message2.length !== 0) {
                    return;
                }

                if(!(hourStart >= 0 && hourStart < 24)) {
                    message1.push('hour is not in range 0-23');
                }
                if(!(hourEnd >= 0 && hourEnd < 24)) {
                    message2.push('hour is not in range 0-23');
                }

                if(!(minuteStart >= 0 && minuteStart < 60)) {
                    message1.push('minute is not in range 0-59');
                }
                if(!(minuteEnd >= 0 && minuteEnd < 60)) {
                    message2.push('hour is not in range 0-59');
                }

                showErrors(message1, message2);
                if(message1.length !== 0 || message2.length !== 0) {
                    return;
                }

                if(hourStart * 3600 + minuteStart * 60 >= hourEnd * 3600 + minuteEnd * 60) {
                    showErrors([], ['bad interval']);
                    return;
                }
            }

            if(type.match(/int|float/i)) {
                var val1 = Number(firstValue);

                if(isNaN(val1)) {
                    showErrors(['value is not number'], []);
                    return;
                }

                var val2 = Number(secondValue);
                if(!$(secondRow).hasClass('hidden')) {
                    if(!val2 || isNaN(val2)) {
                        showErrors([], ['value is not number']);
                        return;
                    }
                }

                if(condition.match(/interval/i) && val1 >= val2) {
                    showErrors([], ['bad interval']);
                    return;
                }
            }

            if(type.match(/date/i) && condition.match(/interval/i)) {
                if(Date.parse(firstValue) >= Date.parse(secondValue)) {
                    showErrors([], ['bad interval']);
                    return;
                }
            }

            if('IPv4' === type) {
                var tokenLen = function(value) {
                    return value.split('.').filter(function(e) {
                        return Number(e) < 255;
                    }).length;
                };

                if(tokenLen(firstValue) !== 4) {
                    showErrors(['is not ip address'], []);
                    return;
                }

                if(!$(secondRow).hasClass('hidden')) {
                    if(tokenLen(secondValue) !== 4) {
                        showErrors([], ['is not ip address']);
                        return;
                    }
                }

                if(condition.match(/interval/i)) {
                    if(ipStringToNum(firstValue) >= ipStringToNum(secondValue)) {
                        showErrors([], ['bad interval']);
                        return;
                    }
                }
            }
        }
        showErrors([], []);
    };

    var _setDateTimeField = function($row, field) {
        $row.find('input')
        .addClass('pikaday')
        .attr('name', field.name)
        .attr('placeholder', 'YYYY-MM-DDTHH:mm:00')
        .attr('readonly', 'true');

        $row.find('input').pikaday({
            theme: 'pikaday-theme',
            minDate: new Date(2014, 1, 1),
            maxDate: new Date(),
            incrementMinuteBy: 10,
            use24hour: true,
            format: 'YYYY-MM-DDTHH:mm:00',
            showSeconds: false
        });
    };

    var _setDateField = function($row, field) {
        $row.find('input')
        .addClass('pikaday')
        .attr('name', field.name)
        .attr('placeholder', 'YYYY-MM-DD')
        .attr('readonly', 'true');

        $row.find('input').pikaday({
            theme: 'pikaday-theme',
            minDate: new Date(2014, 1, 1),
            maxDate: new Date(),
            format: 'YYYY-MM-DD',
            showTime: false,
            showMinutes: false,
            showSeconds: false
        });
    };

    var _setFilter = function(filter) {
        if(filter) {
            var keys = Object.getOwnPropertyNames(filter).filter(function(e) {
                return 'orForAnd' === dashboardJSON.filter[e].condition; // get only filter panel
            });

            keys.map(function(name) {
                var savedFilter = filter[name].values;
                var $panel = _createPanel(name,
                    {
                        name: savedFilter[0].name,
                        type: savedFilter[0].type,
                        dict: savedFilter[0].type.replace(/(dict-)|(tree-)/, ''),
                        condition: savedFilter[0].condition,
                        values: savedFilter[0].values,
                        description: dashboard.fieldsType[savedFilter[0].name].description
                    });
                for(var i = 1; i < savedFilter.length; i++) {
                    var dict = (savedFilter[i].type) ? savedFilter[i].type.replace(/(dict-)|(tree-)/, '') : null;
                    _addRow(name,
                        {
                            name: savedFilter[i].name,
                            type: savedFilter[i].type,
                            dict: dict,
                            condition: savedFilter[i].condition,
                            values: savedFilter[i].values,
                            description: savedFilter[i].name
                        }, $panel, 'inner-');
                }
            });
        }
    };

    // public
    return {
        init: _init,
        setFilter: _setFilter
    }
})();