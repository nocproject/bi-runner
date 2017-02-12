var NocFilterPanel = (function() {
    // private var
    var dashboard;

    var _init = function(board) {
        dashboard = board;

        $("#fields")
        .select2(_selectConfig())
        .on('change', function() {
            console.log("changed  to : ", $(this).val());
            if($(this).val()) {
                _createPanel($(this));
                $(this).val(null).trigger('change');
            }
        })
        .val(null).trigger('change');

        $('.periodic').mask('00:00');
        $('.ipv4').mask('099.099.099.099');
    };

    var determinateType = function(name, field) {

        if(field.dict) {
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
                        $field: "value"
                    },
                    '%' + filterPattern + '%'
                ]
            }
        }
        return query
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

    var _createPanel = function(element) {
        var filterPanel = '<div class="panel" style="margin-bottom: 10px">\n    <div class="panel-heading" style="border-color: #ddd;">\n        <div>\n            <div class="title-left">Field name: <b>{name}</b>, {type}</div>\n            <div style="float: right;" class="close-panel hand">\n                <i class="fa fa-times-circle" aria-hidden="true"></i>\n            </div>\n            <div style="clear:both;"></div>\n        </div>\n    </div>\n    <div class="panel-body" style="padding-bottom: 0;">\n        <form class="form-horizontal">\n            <div class="filter-rows">\n            </div>\n            <div class="form-group buttons" style="margin-bottom: 10px;">\n                <!--<div class="col-md-offset-1 pull-left">-->\n                <!--<a href="#" class="btn btn-default pull-left chart-show btn-sm" disabled>Show Chart</a>-->\n                <!--</div>-->\n                <div class="pull-right" style="margin-right: 10px;">\n                    <a class="btn btn-default clean-filter btn-sm">Clear</a>\n                    <a class="btn btn-default apply-filter btn-sm">Apply</a>\n                </div>\n            </div>\n        </form>\n    </div>\n</div>';
        var field = _parseFieldValue(element);
        var id = new Date().getTime();
        var $panel, typeText;

        if(!field.type.indexOf('dict-')) {
            typeText = 'dictionary: <b>' + field.dict + '</b>';
        } else {
            typeText = 'type: <b>' + field.type + '</b>';
        }

        filterPanel = filterPanel.replace(/{name}/g, field.name);
        filterPanel = filterPanel.replace(/{type}/g, typeText);

        $panel = $(filterPanel);
        $('.filters-by-field').append($panel);
        _addRow(element, $panel);

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
                var pattern, value2;

                console.log('condition : ' + condition + ',' + name + '=' + value);

                _validate(this, type, condition);

                if(condition.match(/interval/i)) {
                    value2 = $(this).parent().next().find('.values').val();
                }

                if('periodic.interval' === condition) {
                    value = [value, value2];
                } else if('DateTime' === type) {
                    pattern = '%Y-%m-%dT%H:%M:00';
                    value = [dashboard.parseDate(value, pattern)];

                    if('interval' === condition) {
                        value.push(dashboard.parseDate(value2, pattern));
                    }
                } else if('Date' === type) {
                    pattern = '%Y-%m-%d';
                    value = [dashboard.parseDate(value, pattern)];

                    if('interval' === condition) {
                        value2 = $(this).parent().next().find('.values').val();

                        value.push(dashboard.parseDate(value2, pattern));
                    }
                } else if('interval' === condition) {
                    value = [value, value2];
                } else {
                    value = [value];
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
    };

    var _replaceInput = function(field, $row, conditionOptions) {
        if(!field.type.indexOf('dict-')) {
            $row.find('input').first() // add multiple attr for multiple select
            .replaceWith('<select name="' + field.name + '" class="form-control values"></select>');

            $row.find('.first-value>div>select')
            .select2({
                theme: 'bootstrap',
                placeholder: 'Select from ' + field.dict,
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
        } else if('DateTime' === field.type) {
            _setDateTimeField($row, field);
            conditionOptions.push(
                {id: 'interval', text: 'interval'},
                {id: 'periodic.interval', text: 'periodic interval'},
                {id: '$lt', text: '<'},
                {id: '$le', text: '<='},
                {id: '$gt', text: '>'},
                {id: '$ge', text: '>='}
            );
        } else if('Date' === field.type) {
            _setDateField($row, field);
            conditionOptions.push(
                {id: 'interval', text: 'interval'},
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
                {id: '$lt', text: '<'},
                {id: '$gt', text: '>'}
            );
        } else {
            conditionOptions.push(
                {id: 'interval', text: 'interval'},
                {id: '$lt', text: '<'},
                {id: '$le', text: '<='},
                {id: '$gt', text: '>'},
                {id: '$ge', text: '>='}
            );
        }
    };

    var _addRow = function(element, $panel, prefix) {
        var rowFilter;
        var field = _parseFieldValue(element);
        var conditionOptions = [
            {id: '$eq', text: '=='},
            {id: '$ne', text: '<>'}
        ];

        if('inner-' !== prefix) {
            rowFilter = '<div class="form-group">\n    <label class="control-label col-md-1 col-md-offset-1">Condition:</label>\n    <div class="col-md-2">\n        <select class="form-control condition"></select>\n    </div>\n    <div class="first-value">\n        <label class="control-label col-md-2">Value:</label>\n        <div class="col-md-6">\n            <input type="text" class="form-control values" name="{name}" placeholder="Value">\n        </div>\n    </div>\n</div>\n<div class="form-group second-value hidden">\n    <label class="control-label col-md-6">To Value:</label>\n    <div class="col-md-6">\n        <input type="text" class="form-control values" name="{name}" placeholder="To Value">\n    </div>\n</div>\n<div class="form-group">\n    <label class="control-label col-md-2">List of fields (OR) :</label>\n    <div class="col-md-6">\n        <select id="inner-fields"></select>\n    </div>\n</div>';
        } else {
            rowFilter = '<div class="form-group">\n    <label class="control-label col-md-2 remove-inner-row">\n        <i class="fa fa-times hand" aria-hidden="true" style="padding-right: 10px;"></i>{description}</label>\n    <label class="control-label col-md-1">Condition:</label>\n    <div class="col-md-2">\n        <select class="form-control condition"></select>\n    </div>\n    <div class="first-value">\n        <label class="control-label col-md-1">Value:</label>\n        <div class="col-md-6">\n            <input type="text" class="form-control values" name="{name}" placeholder="Value">\n        </div>\n    </div>\n</div>\n<div class="form-group second-value hidden">\n    <label class="control-label col-md-6">To Value:</label>\n    <div class="col-md-6">\n        <input type="text" class="form-control values" name="{name}" placeholder="To Value">\n    </div>\n</div>'
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
                    _addRow($(this), $panel, 'inner-');
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
            data: conditionOptions
        });

        $row.find('.condition')
        .on('change', function() {
            if(!$row.filter('.second-value').hasClass('hidden')) {
                $row.filter('.second-value').addClass('hidden');
            }
            if('interval' === $(this).val()) {
                $row.filter('.second-value').removeClass('hidden');
            }
            if('periodic.interval' === $(this).val()) {
                $row.filter('.second-value').removeClass('hidden');
                $row.find('input').replaceWith('<input type="text" class="form-control values periodic" name="' + field.name + '" placeholder="HH:mm">');
            } else {
                if(!$row.filter('.second-value').hasClass('pikaday') && 'DateTime' === field.type) {
                    _setDateTimeField($row, field);
                }
            }
            console.log('condition changed to : ' + $(this).val());
        });
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

        if(!firstValue) {
            showErrors(['empty value'], []);
            return;
        }

        if(!$(secondRow).hasClass('hidden') && !secondValue) {
            showErrors([], ['empty value']);
            return;
        }

        if('periodic.interval' === condition) {
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

            if('interval' === condition && val1 >= val2) {
                showErrors([], ['bad interval']);
                return;
            }
        }

        if(type.match(/date/i) && 'interval' === condition) {
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

            if('interval' === condition) {
                if(ipStringToNum(firstValue) >= ipStringToNum(secondValue)) {
                    showErrors([], ['bad interval']);
                    return;
                }
            }
        }
        showErrors([], []);
    };

    var _setDateTimeField = function($row, field) {
        $row.find('input')
        .addClass('pikaday')
        .attr('name', field.name)
        .attr('readonly', 'true');

        $row.find('input').pikaday({
            incrementMinuteBy: 10,
            theme: 'pikaday-theme',
            use24hour: true,
            format: 'YYYY-MM-DDTHH:mm:00',
            showSeconds: false
        });
    };

    var _setDateField = function($row, field) {
        $row.find('input')
        .addClass('pikaday')
        .attr('name', field.name)
        .attr('readonly', 'true');

        $row.find('input').pikaday({
            theme: 'pikaday-theme',
            format: 'YYYY-MM-DD',
            showTime: false,
            showMinutes: false,
            showSeconds: false
        });
    };

    // public
    return {
        init: _init
    }
})();