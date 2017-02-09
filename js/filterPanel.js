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
                _addRow($(this).val());
                $(this).val(null).trigger('change');
            }
        })
        .val(null).trigger('change');

    };

    var _selectConfig = function() {
        var determinateType = function(name, field) {

            if(field.dict) {
                return 'dict-' + field.dict;
            }

            if('UInt32' === field.type && 'ip' === name) {
                return 'IPv4';
            }

            return field.type;
        };

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

    var _addRow = function(fieldValue) {
        var type;
        var filterByField = '<div id="filter-panel{id}" class="panel panel-default" style="margin-bottom: 10px">\n    <div class="panel-heading">\n        <div>\n            <div class="title-left">Field name: <b>{name}</b>, {type}</div>\n            <div style="cursor: pointer;cursor: hand;float: right;" class="close-panel">\n                <i class="fa fa-times-circle" aria-hidden="true"></i>\n            </div>\n            <div style="clear:both;"></div>\n        </div>\n    </div>\n    <div class="panel-body" style="padding-bottom: 0px;">\n        <form class="form-horizontal">\n            <div class="form-group">\n                <label class="control-label col-md-1 col-md-offset-1">Condition:</label>\n                <div class="col-md-2">\n                    <select class="form-control values condition"></select>\n                </div>\n                <div class="first-value">\n                    <label class="control-label col-md-2" for="value-1{id}">Value:</label>\n                    <div class="col-md-6">\n                        <input type="text" class="form-control" id="value-1{id}" placeholder="Value">\n                    </div>\n                </div>\n            </div>\n            <div class="form-group second-value hidden">\n                <label class="control-label col-md-6" for="value-2{id}">To Value:</label>\n                <div class="col-md-6">\n                    <input type="text" class="form-control" id="value-2{id}" placeholder="To Value">\n                </div>\n            </div>\n            <!--<hr style="margin-top: 10px;margin-bottom: 10px;">-->\n            <!--<div class="form-group" style="margin-bottom: 10px;">-->\n            <!--<label class="col-md-1 control-label">Show chart:</label>-->\n            <!--<div class="col-md-2">-->\n            <!--<input type="checkbox" value="1" name="" class="form-control show-chart"/>-->\n            <!--</div>-->\n            <!--<label class="control-label col-md-1">Chart type:</label>-->\n            <!--<div class="col-md-1">-->\n            <!--<select class="form-control values chart-type" disabled></select>-->\n            <!--</div>-->\n            <!--<label class="control-label col-md-1">Field:</label>-->\n            <!--<div class="col-md-3">-->\n            <!--<select class="form-control values chart-fields" disabled> </select>-->\n            <!--</div>-->\n            <!--<label class="control-label col-md-1">Function:</label>-->\n            <!--<div class="col-md-2">-->\n            <!--<select class="form-control values chart-func" disabled></select>-->\n            <!--</div>-->\n            <!--</div>-->\n            <div class="form-group" style="margin-bottom: 10px;">\n                <!--<div class="col-md-offset-1 pull-left">-->\n                <!--<a href="#" class="btn btn-default pull-left chart-show btn-sm" disabled>Show Chart</a>-->\n                <!--</div>-->\n                <div class="pull-right" style="margin-right: 10px;">\n                    <a href="#" class="btn btn-default clear-filter btn-sm">Clear</a>\n                    <a href="#" class="btn btn-default apply-filter btn-sm">Apply</a>\n                </div>\n            </div>\n        </form>\n    </div>\n</div>';
        var id = new Date().getTime();
        var field = fieldValue.split(',');
        var conditionOptions = [
            {id: '$eq', text: '=='},
            {id: '$ne', text: '<>'}
        ];
        var chartTypes = [
            {id: 'bar', text: 'Bar'},
            {id: 'pie', text: 'Pie'},
            {id: 'line', text: 'Line'}
        ];
        var chartFunction = [
            {id: '$count', text: 'Count'},
            {id: '$sum', text: 'Sum'}
        ];
        var value1 = 'value-1' + id;
        var value2 = 'value-2' + id;
        var setDataTimeField = function() {
            $('#' + value1).replaceWith('<input type="text" id="' + value1 + '" class="form-control values pikaday" readonly>');
            $('#' + value2).replaceWith('<input type="text" id="' + value2 + '" class="form-control values pikaday" readonly>');

            $('#' + value1 + ',#' + value2).pikaday({
                incrementMinuteBy: 10,
                theme: 'pikaday-theme',
                use24hour: true,
                format: 'YYYY-MM-DDTHH:mm:00',
                showSeconds: false
            });
        };
        var setDataField = function() {
            $('#' + value1).replaceWith('<input type="text" id="' + value1 + '" class="form-control values pikaday" readonly>');
            $('#' + value2).replaceWith('<input type="text" id="' + value2 + '" class="form-control values pikaday" readonly>');

            $('#' + value1 + ',#' + value2).pikaday({
                theme: 'pikaday-theme',
                format: 'YYYY-MM-DD',
                showTime: false,
                showMinutes: false,
                showSeconds: false
            });
        };

        filterByField = filterByField.replace(/{id}/g, id);

        filterByField = filterByField.replace('{name}', field[0]);

        if(!field[1].indexOf('dict-')) {
            type = 'dictionary: <b>' + field[2] + '</b>';
        } else {
            type = 'type: <b>' + field[1] + '</b>';
        }

        filterByField = filterByField.replace('{type}', type);

        $('.filters-by-field').append($(filterByField));

        if(!field[1].indexOf('dict-')) {
            $('#' + value1).replaceWith('<select id="' + value1 + '" class="form-control values"></select>');
            // $('#' + value1).replaceWith('<select id="' + value1 + '" class="form-control values" multiple></select>');
            $('#' + value1).select2({
                theme: 'bootstrap',
                placeholder: 'Select from ' + field[2],
                // minimumInputLength: 2,
                ajax: {
                    url: '/api/bi/',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    delay: 250,
                    data: function(params) {
                        return JSON.stringify(_valuesListQuery(field[0], field[2], params.term));
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
        } else if('DateTime' === field[1]) {
            setDataTimeField();
            conditionOptions.push(
                {id: 'interval', text: 'interval'},
                {id: 'periodic.interval', text: 'periodic interval'},
                {id: '$lt', text: '<'},
                {id: '$le', text: '<='},
                {id: '$gt', text: '>'},
                {id: '$ge', text: '>='}
            );
        } else if('Date' === field[1]) {
            setDataField();
            conditionOptions.push(
                {id: 'interval', text: 'interval'},
                {id: '$lt', text: '<'},
                {id: '$le', text: '<='},
                {id: '$gt', text: '>'},
                {id: '$ge', text: '>='}
            );
        } else if('IPv4' === field[1]) {
            console.log('setting mask for ip, change placeholder to xxx.xxx.xxx.xxx');
            $('#' + value1).mask('099.099.099.099').attr('placeholder', 'xxx.xxx.xxx.xxx');
            $('#' + value2).mask('099.099.099.099').attr('placeholder', 'xxx.xxx.xxx.xxx');
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

        $('#filter-panel' + id).find('.condition')
        .select2({
            theme: 'bootstrap',
            placeholder: 'Select a condition',
            minimumResultsForSearch: Infinity,
            data: conditionOptions
        });

        $('#filter-panel' + id).find('.chart-type')
        .select2({
            theme: 'bootstrap',
            placeholder: 'Select a condition',
            minimumResultsForSearch: Infinity,
            data: chartTypes
        });
        $('#filter-panel' + id).find('.chart-func')
        .select2({
            theme: 'bootstrap',
            placeholder: 'Select a condition',
            minimumResultsForSearch: Infinity,
            data: chartFunction
        });


        $('#filter-panel' + id).find('.values.chart-fields').select2(_selectConfig());

        $('#filter-panel' + id).find('.close-panel')
        .on('click', function() {
            console.log(field + ' (' + id + ')  closing...');
            $(this).parents('.panel').remove();
            NocFilter.deleteFilter(field[0] + dashboard.fiedlNameSeparator + id);
            dashboard.drawAll();
        });

        $('#filter-panel' + id).find('.condition')
        .on('change', function(e) {
            if(!$('#filter-panel' + id).find('.second-value').hasClass('hidden')) {
                $('#filter-panel' + id).find('.second-value').addClass('hidden');
            }
            if('interval' === $(this).val()) {
                $('#filter-panel' + id).find('.second-value').removeClass('hidden');
            }
            if('periodic.interval' === $(this).val()) {
                $('#filter-panel' + id).find('.second-value').removeClass('hidden');
                $('#' + value1).replaceWith('<input type="text" class="form-control values" id="' + value1 + '" placeholder="hh:mm">').mask('00:00');
                $('#' + value2).replaceWith('<input type="text" class="form-control values" id="' + value2 + '" placeholder="hh:mm">').mask('00:00');
            } else {
                if(!$('#' + value1).hasClass('pikaday') && 'DateTime' === field[1]) {
                    setDataTimeField();
                }
            }
            console.log('condition changed to : ' + $(this).val());
        });

        function notValidate(values, type, condition) {
            var toScreen = function(which, message) {
                $('#filter-panel' + id).find('.' + which + '-value>div>.help-block').remove();
                $('#filter-panel' + id).find('.' + which + '-value').addClass('has-error');
                $('#filter-panel' + id).find('.' + which + '-value').find('div')
                .append($('<span class="help-block">' + message.join(', ') + '</span>'));
            };

            function showErrors(message1, message2) {
                console.log('from value : ' + message1.join(', '));
                console.log('to   value : ' + message2.join(', '));
                if(message1.length > 0) {
                    toScreen('first', message1);
                } else {
                    $('#filter-panel' + id).find('.first-value').removeClass('has-error');
                    $('#filter-panel' + id).find('.first-value>div>.help-block').remove();
                }
                if(message2.length > 0) {
                    toScreen('second', message2);
                } else {
                    $('#filter-panel' + id).find('.second-value>div>.help-block').remove();
                    $('#filter-panel' + id).find('.second-value').removeClass('has-error');
                }
            }

            if(!values[0]) {
                showErrors(['empty value'], []);
                return true;
            }
            if(!$('#filter-panel' + id).find('.second-value').hasClass('hidden') && !values[1]) {
                showErrors([], ['empty value']);
                return true;
            }

            if('periodic.interval' === condition) {
                var message1 = [], message2 = [];
                var hourStart, hourEnd, minuteStart, minuteEnd;

                if(values[0].indexOf(':') !== 2) {
                    message1.push('format error, must be hh:mm');
                }
                if(values[1].indexOf(':') !== 2) {
                    message2.push('format error, must be hh:mm');
                }

                showErrors(message1, message2);
                if(message1.length !== 0 || message2.length !== 0) {
                    return true;
                }

                hourStart = Number(values[0].split(':')[0]);
                if(isNaN(hourStart)) {
                    message1.push('hour is not number');
                }
                hourEnd = Number(values[1].split(':')[0]);
                if(isNaN(hourEnd)) {
                    message2.push('hour is not number');
                }
                minuteStart = Number(values[0].split(':')[1]);
                if(isNaN(minuteStart)) {
                    message1.push('minute is not number');
                }
                minuteEnd = Number(values[1].split(':')[1]);
                if(isNaN(minuteEnd)) {
                    message2.push('minute is not number');
                }

                showErrors(message1, message2);
                if(message1.length !== 0 || message2.length !== 0) {
                    return true;
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
                    return true;
                }

                if(hourStart * 3600 + minuteStart * 60 >= hourEnd * 3600 + minuteEnd * 60) {
                    console.log('bad interval');
                    showErrors([], ['bad interval']);
                    return true;
                }
            }

            if(type.match(/int|float/i)) {
                var val = Number(values[0]);

                if(isNaN(val)) {
                    showErrors(['value is not number'], []);
                    return true;
                }

                val = Number(values[1]);
                if(!$('#filter-panel' + id).find('.second-value').hasClass('hidden')) {
                    if(!val || isNaN(val)) {
                        showErrors([], ['value is not number']);
                        return true;
                    }
                }
            }

            if('IPv4' === type) {
                var tokenLen = function(value) {
                    return value.split('.').filter(function(e) {
                        return Number(e) < 255;
                    }).length;
                };

                if(tokenLen(values[0]) !== 4) {
                    showErrors(['is not ip address'], []);
                    return true;
                }

                if(!$('#filter-panel' + id).find('.second-value').hasClass('hidden')) {
                    if(tokenLen(values[1]) !== 4) {
                        showErrors([], ['is not ip address']);
                        return true;
                    }
                }
            }
            showErrors([], []);
            return false;
        }

        $('#filter-panel' + id).find('.apply-filter')
        .on('click', function() {
            var value1Id = $('#value-1' + id).val();
            var value1 = $('#value-1' + id).text();
            var value2Id = $('#value-2' + id).val();
            var value2 = $('#value-2' + id).text();
            var condition = $('#filter-panel' + id).find('.condition').val();
            var values;
            var intervalDate = function(pattern) {
                var values = [new BI_Value(d3.time.format(pattern).parse(value1Id))];

                if('interval' === condition) {
                    values.push(new BI_Value(d3.time.format(pattern).parse(value2Id)));
                }
                return values;
            };

            if('Date' === field[1]) {
                values = intervalDate('%Y-%m-%d');
            } else if('DateTime' === field[1] && 'periodic.interval' !== condition) {
                values = intervalDate('%Y-%m-%dT%H:%M:00');
            } else {
                values = [new BI_Value(value1Id, value1)];
                if('interval' === condition || 'periodic.interval' === condition) {
                    values.push(new BI_Value(value2Id, value2));
                }
            }
            if(notValidate([value1Id, value2Id], field[1], condition)) return;
            NocFilter.updateFilter(field[0] + dashboard.fiedlNameSeparator + id, field[1], values, condition);
            dashboard.drawAll();
        });

        $('#filter-panel' + id).find('.clear-filter')
        .on('click', function() {
            console.log('clear filter');
            console.log('panel id : filter-panel' + id);
            console.log('field : ' + field);
            console.log('value : ' + $('#value-1' + id).val());
            console.log('condition : ' + $('#filter-panel' + id).find('.condition').val());
            NocFilter.deleteFilter(field[0] + dashboard.fiedlNameSeparator + id);
            dashboard.drawAll();
        });

        $('#filter-panel' + id).find('.show-chart')
        .checkboxpicker({
            offActiveCls: 'btn-default',
            onActiveCls: 'btn-primary'
        })
        .on('change', function() {
            var isChecked = !($(this).is(':checked'));

            console.log('show chart : ' + isChecked);
            $('#filter-panel' + id).find('.chart-type').attr('disabled', isChecked);
            $('#filter-panel' + id).find('.chart-fields').attr('disabled', isChecked);
            $('#filter-panel' + id).find('.chart-show').attr('disabled', isChecked);
            $('#filter-panel' + id).find('.chart-func').attr('disabled', isChecked);
        });
    };
    // public
    return {
        init: _init
    }
})();