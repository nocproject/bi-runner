var Dashboard = function(element) {
    //public properties
    this.element = element;

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
        var command = arg.split('.');
        var format = "%Y-%m-%d";
        var now = new Date;

        if(command.length === 2) {
            if('cur' === command[0]) {
                now = new Date;
            }

            if('prev' === command[0]) {
                now = d3.time[command[1]].offset(now, -1);
            }

            start = d3.time[command[1]](now);
            end = d3.time[command[1]].ceil(now);

            console.log(dashboard.dateToString(start, format), dashboard.dateToString(end, format));
            NocFilter.setStartCondition([start, end]);
            downChevron();
            drawAll();
        }
    };

    this.clear = function() {
        $(element).replaceWith('<div id="dashboard"></div>');
        $('#report-name').text(null);
    };

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

    this.createFieldSelector = function(container, datasource) {
        var fieldSelector = '<div class="row">\n    <div class="col-md-12">\n        <div id="field-selector" class="chart-wrapper">\n            <div class="chart-title">\n                <div class="title-left">Field Selector</div>\n                <div class="title-right collapsed"></div>\n                <div style="clear:both;"></div>\n            </div>\n            <div class="chart-stage collapse" aria-expanded="false">\n                <div class="row">\n                    <div class="col-md-5 col-md-offset-1">\n                        List of Fields\n                        <select id="fields">\n                            <option disabled="disabled">Loading...</option>\n                        </select>\n                    </div>\n                </div>\n            </div>\n            <div class="chart-notes">Field Selector</div>\n        </div>\n    </div>\n</div>\n';

        addCollapsed(fieldSelector, '#field-selector', container);

        $("#fields")
        .select2({
            theme: "bootstrap",
            placeholder: "Select a field",
            minimumResultsForSearch: Infinity,
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
            }
        })
        .on("change", function() {
            console.log("changed  to : ", $(this).val());
        });

        d3.json('/api/bi/')
        .header('Content-Type', 'application/json')
        .post(
            '{"params": ["' + datasource + '"],"id": 0,"method": "get_datasource_info"}',
            function(error, data) {
                if(error)
                    throw new Error(error);

                console.log(data.result);
                $('#fields').find('>option').remove();
                data.result.fields.map(function(field) {
                    var text = field.description ? field.description : field.name;
                    $('#fields').append($('<option>', {
                        value: field.name,
                        text: text + "," + field.type,
                        title: text
                    }));
                });
            }
        );
    };

    this.createTimeSelector = function(container) {
        var timeSelector = '<div class="row">\n    <div class="col-md-12">\n        <div id="time-selector" class="chart-wrapper">\n            <div class="chart-title">\n                <div class="title-left">{title}</div>\n                <div class="title-right collapsed"></div>\n                <div style="clear:both;"></div>\n            </div>\n            <div class="chart-stage collapse" aria-expanded="false">\n                <div class="row">\n                    <div class="btn-group-vertical nav-stack col-md-2 col-md-offset-1" style="padding-top: 30px;">\n                        <a onclick="dashboard.timeSelector(\'cur.day\')" class="btn btn-default"\n                           style="margin-bottom: 10px;">Today</a>\n                        <a onclick="dashboard.timeSelector(\'cur.monday\')" class="btn btn-default"\n                           style="margin-bottom: 10px;">This                            week</a>\n                        <a onclick="dashboard.timeSelector(\'cur.month\')" class="btn btn-default"\n                           style="margin-bottom: 10px;">This                            month</a>\n                        <a onclick="dashboard.timeSelector(\'cur.year\')" class="btn btn-default"\n                           style="margin-bottom: 10px;">This                            year</a>\n                    </div>\n                    <div class="btn-group-vertical nav-stack col-md-2" style="padding-top: 30px;">\n                        <a onclick="dashboard.timeSelector(\'prev.day\')" class="btn btn-default"\n                           style="margin-bottom: 10px;">Yesterday</a>\n                        <a onclick="dashboard.timeSelector(\'prev.monday\')" class="btn btn-default"\n                           style="margin-bottom: 10px;">Previous                            week </a>\n                        <a onclick="dashboard.timeSelector(\'prev.month\')" class="btn btn-default"\n                           style="margin-bottom: 10px;">Previous                        month </a>\n                        <a onclick="dashboard.timeSelector(\'prev.year\')" class="btn btn-default"\n                           style="margin-bottom: 10px;">Previous                            year </a>\n                    </div>\n                    <div class="col-md-5 col-md-offset-1" style="padding-bottom: 10px;">\n                        <div class="pull-left">\n                            <input id="startInterval" type="text" style="display: none;"/>\n                            <div id="startIntervalContainer"></div>\n                        </div>\n                        <div class="pull-left">\n                            <input id="endInterval" type="text" style="display: none;"/>\n                            <div id="endIntervalContainer"></div>\n                            <button id="selectBtn" type="button" class="btn btn-default pull-right"\n                                    style="width: 100px" disabled="disabled">\n                                Select\n                            </button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class="chart-notes">Time Selector</div>\n        </div>\n    </div>\n</div>\n';

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
            NocFilter.setStartCondition([startDate, endDate]);
            downChevron();
            drawAll();
        });
    };

    this.export = function() {

        if(!dashboard.exportQuery) {
            console.log('export query is null, you must define query into board definition');
            return;
        }

        dashboard.exportQuery.params[0].filter = dashboard.widgets[0].query.params[0].filter;
        $("#export-btn").off("click");

        d3.json('/api/bi/')
        .header("Content-Type", "application/json")
        .post(
            JSON.stringify(dashboard.exportQuery),
            function(error, data) {
                if(error)
                    throw new Error(error);

                if(failResult('export', data)) return;

                var blob = new Blob([toCsv(data.result.result, data.result.fields, '"', ';')], {type: "text/plain;charset=utf-8"});
                saveAs(blob, 'export.csv');

                $('#export-btn').on("click", "", function() {
                    dashboard.export();
                    $('#export-btn').find('.spinner').show();
                });
                $('#export-btn').find('.spinner').hide();
                console.log('export done.');
            })
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

                $('#export-btn').on("click", "", function(e) {
                    dashboard.export();
                    $('#export-btn').find('.spinner').show();
                });

                dashboard.clear();
                var container = $("<div class='container-fluid'></div>").appendTo($(element));
                var sortedByRows = dashboardJSON.layout.cells.sort(function(a, b) {
                    return a.row - b.row
                });
                var rowPosition = undefined;
                var currentRow;

                $('#report-name').text(dashboardJSON.title);
                // selectors
                dashboard.createTimeSelector(container);
                dashboard.createFieldSelector(container, data.result.datasource);

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

                if('export' in dashboardJSON) {
                    dashboard.exportQuery = dashboardJSON.export;
                } else {
                    dashboard.exportQuery = null;
                }

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

                NocFilter.init({
                    widgets: dashboard.widgets,
                    startCondition: [new Date('2016-01-01'), new Date('2017-01-01')]
                });
                drawAll();
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
        var name = element.split('.')[1];

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

    var filterToggle = function(widget, field, value, text) {
        var chart = widget.chart;
        var el = chart.anchor();
        var resets = $(el).closest(".chart-wrapper").find(".reset");
        var filters = $(el).closest(".chart-wrapper").find(".filter");
        var filterDate = NocFilter.getDate();

        if(value) {
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

        if(filterDate && field === 'date' && value) {
            if(value[0].getTime() === filterDate[0].getTime() &&
                value[1].getTime() === filterDate[1].getTime()) {
                return;
            }
        }

        NocFilter.updateFilter(field, chart.filters());

        if(value) {
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

    /**
     * Converts an array of objects (with identical schemas) into a CSV table.
     * @param {Array} objArray An array of objects.  Each object in the array must have the same property list.
     * @param {nameArray} nameArray an array names of fields.
     * @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
     * @param {string} cDelimiter The column delimiter.  Defaults to a comma (,) if omitted.
     * @return {string} The CSV equivalent of objArray.
     */
    var toCsv = function(objArray, nameArray, sDelimiter, cDelimiter) {
        var i, l, names = [], name, value, obj, row, output = "", n, nl;

        function toCsvValue(theValue, sDelimiter) {
            var t = typeof (theValue), output;
            if(typeof (sDelimiter) === "undefined" || sDelimiter === null) {
                sDelimiter = '"';
            }
            if(t === "undefined" || t === null) {
                output = "";
            } else if(t === "string") {
                output = sDelimiter + theValue + sDelimiter;
            } else {
                output = String(theValue);
            }
            return output;
        }

        // Initialize default parameters.
        if(typeof (sDelimiter) === "undefined" || sDelimiter === null) {
            sDelimiter = '"';
        }
        if(typeof (cDelimiter) === "undefined" || cDelimiter === null) {
            cDelimiter = ",";
        }
        for(i = 0, l = objArray.length; i < l; i += 1) {
            // Get the names of the properties.
            obj = objArray[i];
            row = "";
            if(i === 0) {
                // Loop through the names
                for(name in nameArray) {
                    if(nameArray.hasOwnProperty(name)) {
                        names.push(name);
                        row += [sDelimiter, nameArray[name], sDelimiter, cDelimiter].join("");
                    }
                }
                row = row.substring(0, row.length - 1);
                output += row;
            }
            output += '\n';
            row = "";
            for(n = 0, nl = names.length; n < nl; n += 1) {
                name = names[n];
                value = obj[name];
                if(n > 0) {
                    row += cDelimiter
                }
                row += toCsvValue(value, '"');
            }
            output += row;
        }
        return output;
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
                    filterToggle(widget, 'date', filter, filter ? dashboard.dateToString(filter[0]) + " - " + dashboard.dateToString(filter[1]) : '');
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
                    // var day = (d.date.getDay() === 0) ? 6 : d.date.getDay() - 1;
                    var day = d.day;
                    var name = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

                    return day + '.' + name[day - 1];
                });
                var values = dayOfWeek
                .group()
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
                    filterToggle(widget, 'toDayOfWeek(date)', filter, chart.filters().map(function(element) {
                        return element.split('.')[1];
                    }).join());
                })
                .on('pretransition', spinnerShow)
                .on('renderlet', onRenderLet)
                .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
                .label(function(d) {
                    return d.key.split('.')[1];
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
                    return d[field] + "." + d.name;
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
                        return d.name.split('.')[1];
                    })
                )
                .cx(120)
                // .title(function(d) {
                //     return d.key.split('.')[1] + " :\n" + d.value + " reboot(s)";
                // })
                .on('filtered', function(chart, filter) {
                    console.log('filtered : ' + filter);
                    filterToggle(widget, field, filter, chart.filters().map(function(element) {
                        return reductionName(element);
                    }).join());
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
