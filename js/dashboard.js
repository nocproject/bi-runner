var Dashboard = function(element) {
    //public properties
    this.datasource;
    this.element = element;
    this.fieldsType = {};
    this.fiedlNameSeparator = '.';

    function BI_Value(id, text) {
        this.id = id;
        this.text = text;
    }

    BI_Value.prototype.valueOf = function() {
        return this.id;
    };

    // public methods
    this.reset = function(widget) {
        console.log('reset :', widget);
        dashboard.widgets
        .filter(function(w) {
            console.log(w.chart.anchorName());
            return w.chart.anchorName() === widget;
        })
        .map(function(w) {
            w.chart.filterAll();
            w.chart.render();
        });
    };

    this.setSelectorInterval = function(start, end) {
        $("#time-selector > .chart-title > .title-left").text(dashboard.dateToString(start) + " - " + dashboard.dateToString(end));
    };

    this.timeSelector = function(arg) {
        var start, end;
        var format = "%Y-%m-%d";
        var now = new Date;

        if('cur' === arg.period) {
            now = new Date;
        }

        if('prev' === arg.period) {
            now = d3.time[arg.value].offset(now, -1);
        }

        start = d3.time[arg.value](now);
        end = d3.time[arg.value].ceil(now);

        console.log(dashboard.dateToString(start, format), dashboard.dateToString(end, format));
        NocFilter.setStartDateCondition([start, end]);
        downChevron();
        drawAll();
    };

    this.clear = function() {
        $(element).replaceWith('<div id="dashboard"></div>');
        $('#report-name').text(null);
    };

    this.fieldsSelectConfig = function() {
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

    this.filterByFieldPanel = function(fieldValue) {
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

            $('#' + value1).pikaday({
                incrementMinuteBy: 10,
                theme: 'pikaday-theme',
                use24hour: true,
                format: 'YYYY-MM-DDThh:mm:00',
                showSeconds: false
            });
            $('#' + value2).pikaday({
                incrementMinuteBy: 10,
                theme: 'pikaday-theme',
                format: 'YYYY-MM-DDThh:mm:00',
                use24hour: true,
                showSeconds: false
            });
        };
        var setDataField = function() {
            $('#' + value1).replaceWith('<input type="text" id="' + value1 + '" class="form-control values pikaday" readonly>');
            $('#' + value2).replaceWith('<input type="text" id="' + value2 + '" class="form-control values pikaday" readonly>');

            $('#' + value1).pikaday({
                theme: 'pikaday-theme',
                format: 'YYYY-MM-DD',
                showTime: false,
                showMinutes: false,
                showSeconds: false
            });
            $('#' + value2).pikaday({
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
                        return JSON.stringify(valuesListQuery(field[0], field[2], params.term));
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


        $('#filter-panel' + id).find('.values.chart-fields').select2(this.fieldsSelectConfig());

        $('#filter-panel' + id).find('.close-panel')
        .on('click', function() {
            console.log(field + ' (' + id + ')  closing...');
            $(this).parents('.panel').remove();
            NocFilter.deleteFilter(field[0] + dashboard.fiedlNameSeparator + id);
            drawAll();
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
            drawAll();
        });

        $('#filter-panel' + id).find('.clear-filter')
        .on('click', function() {
            console.log('clear filter');
            console.log('panel id : filter-panel' + id);
            console.log('field : ' + field);
            console.log('value : ' + $('#value-1' + id).val());
            console.log('condition : ' + $('#filter-panel' + id).find('.condition').val());
            NocFilter.deleteFilter(field[0] + dashboard.fiedlNameSeparator + id);
            drawAll();
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

    this.createFieldSelector = function(container) {
        var fieldSelector = '<div class="row">\n    <div class="col-md-12">\n        <div id="field-selector" class="chart-wrapper">\n            <div class="chart-title">\n                <div class="title-left">Filter by Field</div>\n                <div class="title-right collapsed"></div>\n                <div style="clear:both;"></div>\n            </div>\n            <div class="chart-stage collapse" aria-expanded="false">\n                <div class="row">\n                    <form class="form-horizontal">\n                        <div class="form-group">\n                            <label class="col-md-1 col-md-offset-1">List of fields:</label>\n                            <div class="col-md-6">\n                                <select id="fields"></select>\n                            </div>\n                        </div>\n                    </form>\n                </div>\n                <div class="filters-by-field" style="margin: 0 10px 5px 10px;"></div>\n                <!--<a href="#" class="btn btn-default pull-right" style="margin: -3px 10px 3px;">Save</a>-->\n            </div>\n            <div class="chart-notes">Filter</div>\n        </div>\n    </div>\n</div>\n';

        addCollapsed(fieldSelector, '#field-selector', container);

        $("#fields")
        .select2(this.fieldsSelectConfig())
        .on('change', function() {
            console.log("changed  to : ", $(this).val());
            if($(this).val()) {
                dashboard.filterByFieldPanel($(this).val());
                $(this).val(null).trigger('change');
            }
        })
        .val(null).trigger('change');
    };

    this.aggregateByFieldPanel = function() {
    };

    this.createAggregateSelector = function(container) {
        var fieldSelector = '<div class="row">\n    <div class="col-md-12">\n        <div id="field-aggregate" class="chart-wrapper">\n            <div class="chart-title">\n                <div class="title-left">Field Aggregate</div>\n                <div class="title-right collapsed"></div>\n                <div style="clear:both;"></div>\n            </div>\n            <div class="chart-stage collapse" aria-expanded="false">\n                <div class="row">\n                    <form class="form-horizontal aggregate-by-field">\n                        <div class="form-group" style="margin-bottom: 10px;">\n                            <label class="col-md-1 col-md-offset-1">List of fields:</label>\n                        </div>\n                    </form>\n                </div>\n                <div class="filters-by-field" style="margin: 0 10px 5px 10px;"></div>\n                <!--<a href="#" class="btn btn-default pull-right" style="margin: -3px 10px 3px;">Save</a>-->\n            </div>\n            <div class="chart-notes">Aggregate</div>\n        </div>\n    </div>\n</div>\n';

        addCollapsed(fieldSelector, '#field-aggregate', container);
        NocAggregatePanel.init(dashboard);
    };

    this.createTimeSelector = function(container) {
        var timeSelector = '<div class="row">\n    <div class="col-md-12">\n        <div id="time-selector" class="chart-wrapper">\n            <div class="chart-title">\n                <div class="title-left">{title}</div>\n                <div class="title-right collapsed"></div>\n                <div style="clear:both;"></div>\n            </div>\n            <div class="chart-stage collapse" aria-expanded="false">\n                <div class="row">\n                    <div class="btn-group-vertical nav-stack col-md-2 col-md-offset-1" style="padding-top: 30px;">\n                        <a onclick="dashboard.timeSelector({\'period\': \'cur\', \'value\': \'day\'})" class="btn btn-default"\n                           style="margin-bottom: 10px;">Today</a>\n                        <a onclick="dashboard.timeSelector({\'period\': \'cur\', \'value\': \'monday\'})" class="btn btn-default"\n                           style="margin-bottom: 10px;">This week</a>\n                        <a onclick="dashboard.timeSelector({\'period\': \'cur\', \'value\': \'month\'})" class="btn btn-default"\n                           style="margin-bottom: 10px;">This month</a>\n                        <a onclick="dashboard.timeSelector({\'period\': \'cur\', \'value\': \'year\'})" class="btn btn-default"\n                           style="margin-bottom: 10px;">This year</a>\n                    </div>\n                    <div class="btn-group-vertical nav-stack col-md-2" style="padding-top: 30px;">\n                        <a onclick="dashboard.timeSelector({\'period\': \'prev\', \'value\': \'day\'})" class="btn btn-default"\n                           style="margin-bottom: 10px;">Yesterday</a>\n                        <a onclick="dashboard.timeSelector({\'period\': \'prev\', \'value\': \'monday\'})" class="btn btn-default"\n                           style="margin-bottom: 10px;">Previous week </a>\n                        <a onclick="dashboard.timeSelector({\'period\': \'prev\', \'value\': \'month\'})" class="btn btn-default"\n                           style="margin-bottom: 10px;">Previous month </a>\n                        <a onclick="dashboard.timeSelector({\'period\': \'prev\', \'value\': \'year\'})" class="btn btn-default"\n                           style="margin-bottom: 10px;">Previous year </a>\n                    </div>\n                    <div class="col-md-5 col-md-offset-1" style="padding-bottom: 10px;">\n                        <div class="pull-left">\n                            <input id="startInterval" type="text" style="display: none;"/>\n                            <div id="startIntervalContainer"></div>\n                        </div>\n                        <div class="pull-left">\n                            <input id="endInterval" type="text" style="display: none;"/>\n                            <div id="endIntervalContainer"></div>\n                            <a href="#" id="selectBtn" class="btn btn-default pull-right"\n                               style="width: 100px" disabled="disabled">Select</a>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class="chart-notes">Time Selector</div>\n        </div>\n    </div>\n</div>\n';

        addCollapsed(timeSelector, '#time-selector', container);

        var startDate,
            endDate,
            updateStartDate = function() {
                dashboard.startPicker.setStartRange(startDate);
                dashboard.endPicker.setStartRange(startDate);
                dashboard.endPicker.setMinDate(startDate);
            },
            updateEndDate = function() {
                dashboard.startPicker.setEndRange(endDate);
                dashboard.startPicker.setMaxDate(endDate);
                dashboard.endPicker.setEndRange(endDate);
            },
            selectBtn = $("#selectBtn");

        dashboard.startPicker = new Pikaday({
            field: document.getElementById('startInterval'),
            container: document.getElementById('startIntervalContainer'),
            bound: false,
            minDate: new Date(2014, 1, 1),
            maxDate: new Date(),
            theme: 'pikaday-theme',
            firstDay: 1,
            showTime: false,
            showMinutes: false,
            showSeconds: false,
            onSelect: function() {
                startDate = this.getDate();
                updateStartDate();
                if(startDate && endDate) {
                    selectBtn.attr('disabled', false);
                }
            }
        });

        dashboard.endPicker = new Pikaday({
            field: document.getElementById('endInterval'),
            container: document.getElementById('endIntervalContainer'),
            bound: false,
            theme: 'pikaday-theme',
            minDate: new Date(2014, 1, 1),
            maxDate: new Date(),
            firstDay: 1,
            showTime: false,
            showMinutes: false,
            showSeconds: false,
            onSelect: function() {
                endDate = this.getDate();
                updateEndDate();
                if(startDate && endDate) {
                    selectBtn.attr('disabled', false);
                }
            }
        });

        selectBtn.click(function() {
            console.log('selected : ' + startDate + ',' + endDate);
            NocFilter.setStartDateCondition([startDate, endDate]);
            downChevron();
            drawAll();
        });
    };

    var drawBoard = function() {
        var container = $("<div class='container-fluid'></div>").appendTo($(element));
        var sortedByRows = dashboardJSON.layout.cells.sort(function(a, b) {
            return a.row - b.row
        });
        var rowPosition = undefined;
        var currentRow;

        $('#export-btn')
        .on("click", "", function(e) {
            NocExport.export();
            $('#export-btn').find('.spinner').show();
        });

        $('#report-name').text(dashboardJSON.title);

        if('export' in dashboardJSON) {
            dashboard.exportQuery = dashboardJSON.export;
        } else {
            dashboard.exportQuery = null;
        }
        // selectors
        dashboard.createTimeSelector(container);
        dashboard.createFieldSelector(container);
        dashboard.createAggregateSelector(container);

        $.each(sortedByRows, function(index, obj) {
            if(rowPosition !== obj.row) {
                rowPosition = obj.row;
                currentRow = $('<div class="row"></div>').appendTo(container);
            }
            $(objToCell(obj)).appendTo(currentRow);
            $('.reset .' + obj.name).click(function() {
                dashboard.reset(obj.name);
            });
        });

        dashboard.widgets = dashboardJSON.widgets.map(function(widget) {
            if('dataTable' === widget.type) {
                objToTable(widget);
            }
            dashboard[widget.cell] = {
                chart: dc[widget.type]('#' + getWidgetProp(widget.cell, 'cell')),
                query: getWidgetProp(widget.cell, 'query'),
                draw: dashboard[widget.type]
            };
            return dashboard[widget.cell];
        });

        dashboard['row-counter'] = {
            draw: dashboard.counter,
            chart: {
                anchorName: function() {
                    return 'qty-rows'
                }
            },
            query: {
                params: [
                    {
                        fields: NocAggregatePanel.counterField(),
                        datasource: dashboard.datasource
                    }
                ],
                id: 0,
                method: 'query'
            }
        };
        dashboard.widgets.push(dashboard['row-counter']);

        NocExport.updateDuration();

        NocFilter.init({
            widgets: dashboard.widgets,
            fiedlNameSeparator: dashboard.fiedlNameSeparator,
            startDateCondition: [new Date('2016-01-01'), new Date('2017-01-01')]
        });
        drawAll();
    };

    this.run = function(id) { //public
        d3.json('/api/bi/')
        .header("Content-Type", "application/json")
        .post(
            '{"params": ["' + id + '"], "id": 0, "method": "get_dashboard"}',
            function(error, data) {
                if(error)
                    throw new Error(error);

                this.dashboardJSON = data.result;
                if(!this.dashboardJSON) {
                    $('#report-name').text('Report not found!');
                    $('#edit-btn').closest('li').remove();
                    $('#export-btn').closest('li').remove();
                    return;
                }

                d3.json('/api/bi/')
                .header("Content-Type", "application/json")
                .post(
                    '{"params": ["' + data.result.datasource + '"],"id": 0,"method": "get_datasource_info"}',
                    function(error, data) {
                        if(error)
                            throw new Error(error);

                        data.result.fields
                        .sort(function(a, b) {
                            return a.name.localeCompare(b.name);
                        })
                        .map(function(field) {
                            if('date' !== field.name) {
                                dashboard.fieldsType[field.name] = {
                                    type: field.type,
                                    dict: field.dict,
                                    desc: field.description
                                };
                            }
                        });

                        dashboard.clear();
                        dashboard.datasource = dashboardJSON.datasource;
                        dashboard.title = dashboardJSON.title;
                        NocExport.init(dashboard);
                        drawBoard();
                    });
            });
    };

    // format functions
    this.dateToString = function(date, format) {
        format = typeof format !== 'undefined' ? format : '%d.%b.%y';
        return d3.time.format(format)(date);
    };

    this.secondsToString = function(sec) {
        var hours = Math.floor(sec / 3600);
        var minutes = Math.floor((sec % 3600) / 60);
        var seconds = sec % 60;

        return hours + ':' + d3.format("02d")(minutes) + ':' + d3.format("02d")(seconds);
    };

    // utils
    var addCollapsed = function(panel, anchorName, container) {
        $(panel).appendTo(container);
        $(anchorName + '>.chart-title').click(function() {
            var $selector = $(this).next(null);

            if($selector.attr('aria-expanded') === 'true') {
                $(this).children('.title-right').removeClass('expanded');
                $(this).children('.title-right').addClass('collapsed');
            } else {
                $(this).children('.title-right').removeClass('collapsed');
                $(this).children('.title-right').addClass('expanded');
            }
            $selector.collapse("toggle")
        });
    };

    var valuesListQuery = function(field, dict, filterPattern) {
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
                    // $.param('%' + filterPattern + '%')
                    '%' + filterPattern + '%'
                ]
            }
        }
        return query
    };

    var zip = function(data, dateParse) {
        var ndx = crossfilter();

        for(var rowIndex = 0; rowIndex < data.result.result.length; rowIndex++) {
            var record = {};
            var row = data.result.result[rowIndex];
            for(var colIndex = 0; colIndex < data.result.fields.length; colIndex++) {
                if(dateParse && data.result.fields[colIndex] === 'date') {
                    record.date = new Date(Date.parse(row[colIndex]));
                } else {
                    record[data.result.fields[colIndex]] = row[colIndex];
                }
            }
            ndx = ndx.add([record]);
        }
        return ndx;
    };

    var reductionName = function(element) {
        var name = element.text;

        if(name && name.length > 10) {
            return name.substr(0, 10) + "...";
        }
        return name;
    };

    var downChevron = function() {
        $('#time-selector>.chart-title').next().collapse('hide');
        $('#time-selector>.chart-title>.title-right').removeClass('expanded');
        $('#time-selector>.chart-title>.title-right').addClass('collapsed');
    };

    var spinnerHide = function(chart) {
        $(chart.anchor()).closest('.chart-wrapper').find('.spinner').hide();
    };

    var spinnerShow = function(chart) {
        $(chart.anchor()).closest('.chart-wrapper').find('.spinner').show();
    };

    var onRenderLet = function(chart) {
        spinnerHide(chart);
    };

    var filterToggle = function(widget, field, lastValue, allValues, text, type, condition) {
        var chart = widget.chart;
        var el = chart.anchor();
        var resets = $(el).closest(".chart-wrapper").find(".reset");
        var filters = $(el).closest(".chart-wrapper").find(".filter");

        if(lastValue) {
            resets.each(function() {
                $(this).show();
            });
            filters.show();
            filters.text(text);
        } else {
            resets.each(function() {
                $(this).hide();
            });
        }

        NocFilter.updateFilter(field + dashboard.fiedlNameSeparator + chart.anchorName(), type, allValues, condition);

        if(lastValue) {
            // redraw other
            drawExcept(widget.chart.anchorName());
        } else {
            drawAll();
        }
    };

    var getWidgetProp = function(name, prop) {
        var widgets = dashboardJSON.widgets;
        for(var i = 0; i < widgets.length; i++) {
            if(widgets[i].cell === name) {
                if('note' === prop) {
                    return widgets[i][prop] + " : " + widgets[i].type;
                }
                return widgets[i][prop];
            }
        }
        return prop.charAt(0).toUpperCase() + prop.slice(1);
    };

    var propName = function(element) {
        return element.replace(/({|})/g, '');
    };

    var objToCell = function(obj) {
        var cellTpl = '<div class="{class}">\n    <div class="chart-wrapper">\n        <div class="chart-title">\n            <div class="title-left">{title}</div>\n            <div class="title-right spinner"><i class="fa fa-spinner fa-spin fa-fw"></i></div>\n            <div class="title-right reset" style="display: none;padding-left: 5px;">\n                <span class="filter" style="display: none;padding-left: 5px;"></span>\n                <a class="reset {name}" style="display: none;padding-left: 10px">reset</a>\n                <!--<a class="reset" href="javascript:dashboard.{name}.chart.filterAll();dashboard.{name}.chart.render();"-->\n                <!--style="display: none;padding-left: 10px">reset</a>-->\n            </div>\n            <div style="clear:both;"></div>\n        </div>\n        <div class="chart-stage">\n            <div id="{name}" style="height: {height}px">\n            </div>\n        </div>\n        <div class="chart-notes">{note}</div>\n    </div>\n</div>\n';

        cellTpl.match(/{(\w+)}/g).map(function(element) {
            if('{class}' === element) {
                cellTpl = cellTpl
                .replace(element, ['xs', 'lg', 'sm', 'md'].map(function(element) {
                    if(obj[element] > 0) return 'col-' + element + '-' + obj[element];
                }).join(' '));
            } else if('{title}' === element || '{note}' === element) {
                cellTpl = cellTpl
                .replace(element, getWidgetProp(obj.name, propName(element)))
            } else {
                cellTpl = cellTpl
                .replace(element, obj[propName(element)])
            }
        });
        return cellTpl;
    };

    var objToTable = function(widget) {
        var tableTpl = '<table class="table table=hover" id="{cell}"><thead><tr class="header">'.replace('{cell}', widget.cell);

        widget.query.params[0].fields.map(function(field) {
            if('label' in field) {
                tableTpl += '<th class="data-table-col" data-col="{field}">{label}</th>'.replace('{label}', field.label).replace('{field}', field.expr);
            }
        });
        $('#' + widget.cell).replaceWith(tableTpl + '</tr></thead></table>');
    };

    // draw charts
    this.lineChart = function(widget) {
        var chart = widget.chart;

        spinnerShow(chart);
        d3.json('/api/bi/')
        .header("Content-Type", "application/json")
        .post(
            JSON.stringify(widget.query),
            function(error, data) {
                if(error)
                    throw new Error(error);

                if(failResult(chart.anchorName(), data)) return;

                var ndx = zip(data, true);
                var dateDimension = ndx.dimension(function(d) {
                    return d.date;
                });
                var minDate, maxDate;
                if(dateDimension.bottom(1)[0] && dateDimension.top(1)[0]) {
                    minDate = dateDimension.bottom(1)[0].date;
                    maxDate = dateDimension.top(1)[0].date;
                } else {
                    minDate = maxDate = new Date;
                }
                // ToDo make query without start filter!
                // dashboard.startPicker.setMinDate(minDate);
                // dashboard.endPicker.setMinDate(minDate);
                var dim = dateDimension
                .group()
                .reduceSum(function(d) {
                    return d.cnt;
                });

                const height = $(chart.anchor()).closest(".dc-chart").height();
                chart
                .width($(chart.anchor()).closest(".chart-wrapper").width())
                .height(height)
                .controlsUseVisibility(true)
                .elasticY(true)
                .renderHorizontalGridLines(true)
                .dimension(dateDimension)
                .x(d3.time.scale().domain([minDate, maxDate]))
                .yAxisLabel(null, 15)
                .group(dim)
                .on('filtered', function(chart, filter) {
                    console.log('filtered : ' + filter);
                    spinnerShow(chart);
                    filterToggle(
                        widget,
                        'date',
                        filter,
                        filter ? filter.map(function(element) {
                                return new BI_Value(element)
                            }) : [],
                        filter ? dashboard.dateToString(filter[0]) + " - " + dashboard.dateToString(filter[1]) : '',
                        'Date',
                        'interval');
                })
                .on('pretransition', spinnerShow)
                .on('renderlet', onRenderLet);
                // $(chart.anchor()).closest(".chart-wrapper").find("img").remove();
                chart.render();
            }
        );
    };

    this.rowChart = function(widget) {
        var chart = widget.chart;

        spinnerShow(chart);
        d3.json('/api/bi/')
        .header("Content-Type", "application/json")
        .post(
            JSON.stringify(widget.query),
            function(error, data) {
                if(error)
                    throw new Error(error);

                if(failResult(chart.anchorName(), data)) return;

                var ndx = zip(data, false);
                var dayOfWeek = ndx.dimension(function(d) {
                    var day = d.day;
                    var name = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

                    return new BI_Value(day, name[day - 1]);
                });
                var values = dayOfWeek
                .group(function(d) {
                    return d;
                })
                .reduceSum(function(d) {
                    return d.cnt;
                });

                const height = $(chart.anchor()).closest(".dc-chart").height();
                chart
                .width($(chart.anchor()).closest(".chart-wrapper").width() - 10)
                .height(height)
                .controlsUseVisibility(true)
                .margins({
                    top: 20,
                    left: 10,
                    right: 10,
                    bottom: 20
                })
                .group(values)
                .dimension(dayOfWeek)
                .on('filtered', function(chart, filter) {
                    console.log('filtered : ' + filter);
                    filterToggle(
                        widget,
                        'toDayOfWeek(date)',
                        filter,
                        widget.chart.filters(),
                        chart.filters().map(function(element) {
                            return element.text;
                        }).join(),
                        'UInt64',
                        'in.or');
                })
                .on('pretransition', spinnerShow)
                .on('renderlet', onRenderLet)
                .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
                .label(function(d) {
                    return d.key.text;
                })
                .title(function(d) {
                    return d.value;
                })
                .elasticX(true)
                .xAxis()
                .ticks(4);
                $(chart.anchor()).closest(".chart-wrapper").find("img").remove();
                chart.render();
            }
        );
    };

    this.pieChart = function(widget) {
        var chart = widget.chart;
        var field = widget.query.params[0].fields[0].expr;

        spinnerShow(chart);
        d3.json('/api/bi/')
        .header("Content-Type", "application/json")
        .post(
            JSON.stringify(widget.query),
            function(error, data) {
                if(error)
                    throw new Error(error);

                if(failResult(chart.anchorName(), data)) return;

                var ndx = zip(data, false);
                var dimension = ndx.dimension(function(d) {
                    return new BI_Value(d[field], d.name);
                });

                var values = dimension
                .group()
                .reduceSum(function(d) {
                    return d.cnt;
                });

                var width = $(chart.anchor()).closest(".chart-wrapper").width();
                var height = $(chart.anchor()).closest(".dc-chart").height();
                var legendWidth = 330;

                chart
                .width(width)
                .height(height)
                .controlsUseVisibility(true)
                .innerRadius(30)
                .dimension(dimension)
                .group(values)
                .label(function(d) {
                    return reductionName(d.key);
                })
                .legend(dc.legend()
                    .x(width - legendWidth)
                    .y(10)
                    .itemHeight(13)
                    .gap(5)
                    .autoItemWidth(true)
                    .legendWidth(legendWidth)
                    .itemWidth(legendWidth - 5)
                    .legendText(function(d) {
                        return d.name.text;
                    })
                )
                .cx(120)
                // .title(function(d) {
                //     return d.key.split(dashboard.separator)[1] + " :\n" + d.value + " reboot(s)";
                // })
                .on('filtered', function(chart, filter) {
                    console.log('filtered : ' + filter);
                    filterToggle(
                        widget,
                        field,
                        filter,
                        widget.chart.filters(),
                        chart.filters().map(function(element) {
                            return reductionName(element);
                        }).join(),
                        'UInt64',
                        'in');
                })
                .on('pretransition', function(chart) {
                    spinnerShow(chart);
                })
                .on('renderlet', onRenderLet);
                $(chart.anchor()).closest(".chart-wrapper").find("img").remove();
                chart.render();
            }
        );
    };

    this.dataTable = function(widget) {
        var chart = widget.chart;

        spinnerShow(chart);
        d3.json('/api/bi/')
        .header("Content-Type", "application/json")
        .post(
            JSON.stringify(widget.query),
            function(error, data) {
                if(error)
                    throw new Error(error);

                if(failResult(chart.anchorName(), data)) return;

                var ndx = crossfilter();

                for(var rowIndex = 0; rowIndex < data.result.result.length; rowIndex++) {
                    var record = {};
                    var row = data.result.result[rowIndex];
                    for(var colIndex = 0; colIndex < data.result.fields.length; colIndex++) {
                        if(data.result.fields[colIndex] === 'date') {
                            record.date = new Date(Date.parse(row[colIndex]));
                        } else {
                            record[data.result.fields[colIndex]] = row[colIndex];
                        }
                    }
                    ndx = ndx.add([record]);
                }
                // data.result.result.forEach(function(row) {
                // var record = {};
                // for(var index in data.result.fields) {
                // if(data.result.fields[index] === 'date') {
                // record.date = new Date(Date.parse(row[index]));
                // } else {
                // record[data.result.fields[index]] = row[index];
                // }
                // }
                // ndx = ndx.add([record]);
                // });
                var dateDimension = ndx.dimension(function(d) {
                    return d.date;
                });
                // ToDo optimize
                var cols = widget.query.params[0].fields
                .filter(function(field) {
                    return 'label' in field;
                })
                .map(function(field) {
                    if('format' in field) {
                        if('alias' in field) {
                            return {
                                label: field.label, format: function(d) {
                                    return dashboard[field.format](d[field.alias]);
                                }
                            };
                        } else {
                            return {
                                label: field.label, format: function(d) {
                                    return dashboard[field.format](d[field.expr]);
                                }
                            };
                        }
                    }
                    if('alias' in field) {
                        return {
                            label: field.label, format: function(d) {
                                return d[field.alias];
                            }
                        };
                    } else {
                        return {
                            label: field.label, format: function(d) {
                                return d[field.expr];
                            }
                        };
                    }
                });

                var sort = widget.query.params[0].fields
                .filter(function(field) {
                    return 'order' in field;
                })
                .map(function(field) {
                    if('desc' in field) {
                        if(field.desc)
                            return {field: 'alias' in field ? field.alias : field.expr, direct: d3.descending};
                    }
                    return {field: 'alias' in field ? field.alias : field.expr, direct: d3.ascending};
                })[0];
                // setting top dynamically
                // $('.data-table-col').click(function() {
                //     var column = $(this).attr('data-col');
                //     table.sortBy(function(d) {
                //         return d[column];
                //     });
                //     table.redraw();
                // });


                chart
                .dimension(dateDimension)
                .group(function() {
                    return 'click on column header to switch';
                })
                .columns(cols
                    //     [
                    //     function(d) {
                    //         return d.name;
                    //     },
                    //     function(d) {
                    //         return d.segment_name;
                    //     },
                    //     function(d) {
                    //         return dateToString(d.date);
                    //     },
                    //     function(d) {
                    //         return d.cnt;
                    //     }
                    // ]
                )
                .sortBy(function(d) {
                    return parseInt(d[sort.field]);
                })
                .order(sort.direct)
                // .size(Infinity)
                // .endSlice(10)
                .on('renderlet', function(tab) {
                    tab.select('tr.dc-table-group').remove();
                    onRenderLet(tab);
                })
                .on('pretransition', spinnerShow);

                chart.render();
            }
        );
    };

    this.counter = function(widget) {
        var chart = widget.chart;
        var formatter = function(number) {
            var a = Number(number).toFixed(0).split('.');

            a[0] = a[0]
            .split('').reverse().join('')
            .replace(/\d{3}(?=\d)/g, '$& ')
            .split('').reverse().join('');

            return a.join('.');
        };

        d3.json('/api/bi/')
        .header("Content-Type", "application/json")
        .post(
            JSON.stringify(widget.query),
            function(error, data) {
                if(error)
                    throw new Error(error);

                if(failResult(chart.anchorName(), data)) return;

                const qty = data.result.result[0];
                $('#qty-rows').text((qty ? formatter(qty) : '-'));
            }
        );
    };

    var drawAll = function() {
        dashboard.widgets.map(function(widget) {
            widget.draw(widget);
        });
    };

    var drawExcept = function(skippedWidgetName) {
        dashboard.widgets.map(function(widget) {
            var chartName = widget.chart.anchorName();
            if(chartName !== skippedWidgetName) {
                widget.draw(widget);
                console.log('redraw :' + chartName);
            }
        });
    };

    var failResult = function(anchorName, data) {
        console.log(anchorName + " :");
        if(!('result' in data)) {
            console.log(data.error);
            return true;
        }
        console.log('length : ' + data.result.result.length);
        console.log("sql : " + data.result.sql);
        return false;
    }
};
