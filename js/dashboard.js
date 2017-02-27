var Dashboard = function(element) {
    //public properties
    this.element = element;
    this.fieldsType = {};
    this.fieldNameSeparator = '.';
    this.durationIntervalName = 'duration_intervals';

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
        $('#time-selector').find('.chart-title>.title-left').text(dashboard.dateToString(start) + " - " + dashboard.dateToString(end));
        $('#startInterval').val(dashboard.dateToString(start, "%Y-%m-%dT%H:%M:%S"));
        $('#endInterval').val(dashboard.dateToString(end, "%Y-%m-%dT%H:%M:%S"));

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
        $('.apply-filter').each(function() {
            $(this).click();
        });
        $("#selectBtn")
        .attr('disabled', true)
        .removeClass('btn-primary')
        .addClass('btn-default');
        downChevron();
        dashboard.drawAll();
    };

    this.clear = function() {
        $(element).replaceWith('<div id="dashboard"></div>');
        $('#report-name').text(null);
    };

    this.createFieldSelector = function(container) {
        var $fieldSelector = $({gulp_inject: './templates/filter-wrapper.html'});

        addCollapsed($fieldSelector, '#field-selector', container);
        NocFilterPanel.init(dashboard);
    };

    this.createAggregateSelector = function(container) {
        var $agvSelector = $({gulp_inject: './templates/aggregate-wrapper.html'});

        addCollapsed($agvSelector, '#field-aggregate', container);
        NocAggregatePanel.init(dashboard);
    };

    this.createTimeSelector = function(container) {
        var $timeSelector = $({gulp_inject: './templates/time-wrapper.html'});

        addCollapsed($timeSelector, '#time-selector', container);

        var startDate, endDate;
        var updateStartDate = function() {
            $('#startInterval').eq(0).pikaday('setStartRange', startDate);
            $('#endInterval').eq(0)
            .pikaday('setStartRange', startDate)
            .pikaday('setMinDate', startDate);
            if(startDate && endDate) {
                $("#selectBtn")
                .attr('disabled', false)
                .removeClass('btn-primary')
                .addClass('btn-default');
            }
        };
        var updateEndDate = function() {
            $('#endInterval').eq(0).pikaday('setEndRange', endDate);
            $('#startInterval').eq(0)
            .pikaday('setEndRange', endDate)
            .pikaday('setMaxDate', endDate);
            if(startDate && endDate) {
                $("#selectBtn")
                .attr('disabled', false)
                .removeClass('btn-primary')
                .addClass('btn-default');
            }
        };

        $('#startInterval').pikaday({
            container: document.getElementById('startIntervalContainer'),
            bound: false,
            minDate: new Date(2014, 1, 1),
            maxDate: new Date(),
            theme: 'pikaday-theme',
            firstDay: 1,
            incrementMinuteBy: 10,
            use24hour: true,
            format: 'YYYY-MM-DDTHH:mm:00',
            showSeconds: false,
            onSelect: function() {
                startDate = this.getDate();
                console.log('***** startInterval : ' + startDate);
                updateStartDate();
            }
        });

        $('#endInterval').pikaday({
            container: document.getElementById('endIntervalContainer'),
            bound: false,
            theme: 'pikaday-theme',
            minDate: new Date(2014, 1, 1),
            maxDate: new Date(),
            firstDay: 1,
            incrementMinuteBy: 10,
            use24hour: true,
            format: 'YYYY-MM-DDTHH:mm:00',
            showSeconds: false,
            onSelect: function() {
                endDate = this.getDate();
                console.log('***** endInterval : ' + endDate);
                updateEndDate();
            }
        });

        $("#selectBtn").click(function() {
            console.log('selected : ' + startDate + ',' + endDate);
            NocFilter.setStartDateCondition([startDate, endDate]);
            console.log('after set filter : ', NocFilter.getDateInterval());
            $('.apply-filter').each(function() {
                $(this).click();
            });
            $("#selectBtn")
            .removeClass('btn-default')
            .addClass('btn-primary');
            downChevron();
            dashboard.drawAll();
        });
    };

    this.toDate = function(value) {
        return "toDate('" + d3.time.format("%Y-%m-%d")(value) + "')";
    };

    this.toDateTime = function(value) {
        return "toDateTime('" + d3.time.format("%Y-%m-%dT%H:%M:%S")(value) + "')";
    };

    this.parseDate = function(value, pattern) {
        return d3.time.format(pattern).parse(value);
    };

    var drawBoard = function() {
        var container = $("<div class='container-fluid'></div>").appendTo($(element));
        var sortedByRows = dashboardJSON.layout.cells.sort(function(a, b) {
            return a.row - b.row
        });
        var rowPosition = undefined;
        var currentRow;

        $('#export-btn')
        .on("click", "", function() {
            NocExport.export();
            $('#export-btn').find('.spinner').show();
        });

        $('#save-btn')
        .on("click", "", function() {
            saveBoard();
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
            var pattern = '.reset .' + obj.name;

            if(rowPosition !== obj.row) {
                rowPosition = obj.row;
                currentRow = $('<div class="row"></div>').appendTo(container);
            }
            $(objToCell(obj)).appendTo(currentRow);
            $(pattern).click(function() {
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

        NocFilter.init({
            widgets: dashboard.widgets,
            fieldNameSeparator: dashboard.fieldNameSeparator,
            filter: dashboardJSON.filter
        });

        NocFilterPanel.setFilter(dashboardJSON.filter);

        dashboard.drawAll();
    };

    this.setPikaBounds = function(minDate, maxDate) {
        if(!minDate || !maxDate) {
            minDate = new Date($('#startInterval').val());
            maxDate = new Date($('#endInterval').val());
        }

        // $('.values.pikaday').each(function() {
        //     $(this).pikaday('setMinDate', minDate)
        //         .pikaday('setMaxDate', maxDate);
        // });
        $('.values.pikaday')
        .pikaday('setMinDate', minDate)
        .pikaday('setMaxDate', maxDate);
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

                        if(dashboardJSON.filter_fields.indexOf(dashboard.durationIntervalName) !== -1) {
                            data.result.fields.push({
                                dict: null,
                                type: 'DateTime',
                                name: dashboard.durationIntervalName,
                                description: 'Duration Intervals'
                            });
                        }

                        data.result.fields
                        .sort(function(a, b) {
                            var desc1 = a.description ? a.description : 'z';
                            var desc2 = b.description ? b.description : 'z';

                            return desc1.localeCompare(desc2);
                        })
                        .map(function(field) {
                            if(dashboardJSON.filter_fields.indexOf(field.name) !== -1) {
                                dashboard.fieldsType[field.name] = {
                                    type: field.type,
                                    dict: field.dict,
                                    description: (field.description) ? field.description : field.name
                                };
                            }
                        });

                        dashboard.clear();
                        dashboard.datasource = dashboardJSON.datasource;
                        dashboard.title = dashboardJSON.title;
                        dashboard.agv_fields = dashboardJSON.agv_fields;
                        NocExport.init(dashboard);
                        drawBoard();
                    });
            });
    };

    // format functions
    this.dateToString = function(date, format) {
        format = typeof format !== 'undefined' ? format : '%d.%b.%y %H:%M';
        return d3.time.format(format)(date);
    };

    this.secondsToString = function(sec) {
        var hours = Math.floor(sec / 3600);
        var minutes = Math.floor((sec % 3600) / 60);
        var seconds = sec % 60;

        return hours + ':' + d3.format("02d")(minutes) + ':' + d3.format("02d")(seconds);
    };

    // utils
    var addCollapsed = function($panel, anchorName, container) {
        $panel.appendTo(container);
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
        var $time = $('#time-selector');
        $time.find('>.chart-title').next().collapse('hide');
        $time.find('.chart-title>.title-right').removeClass('expanded');
        $time.find('.chart-title>.title-right').addClass('collapsed');
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

    var updateWidgetTitle = function(chart, lastValue, text) {
        var $el = $(chart);
        var $resets = $el.closest(".chart-wrapper").find(".reset");
        var $filters = $el.closest(".chart-wrapper").find(".filter");

        if(!text) {
            $resets.hide();
            return;
        }

        if(lastValue) {
            $resets.show();
            $filters.show().text(text);
        }
    };

    var filterToggle = function(widget, field, lastValue, allValues, text, type, condition) {
        var chart = widget.chart;

        updateWidgetTitle(chart.anchor(), lastValue, text);

        NocFilter.updateFilter(field + dashboard.fieldNameSeparator + chart.anchorName(), type, allValues, condition);

        if(lastValue) {
            // redraw other
            drawExcept(widget.chart.anchorName());
        } else {
            dashboard.drawAll();
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
        return element.replace(/([{}])/g, '');
    };

    var objToCell = function(obj) {
        var cellTpl = {gulp_inject: './templates/cell-tpl.html'};

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

    var saveBoard = function() {
        var filter = NocFilter.getFilter();

        if(!dashboardJSON.hasOwnProperty('filter')) {
            dashboardJSON.filter = {};
        }

        var keys = Object.getOwnPropertyNames(filter)
            .filter(function(e) {
                return 'orForAnd' === filter[e].condition; // get only filter panel
            })
        ;

        var savedKeys = Object.getOwnPropertyNames(dashboardJSON.filter);

        savedKeys.map(function(name) {
            delete dashboardJSON.filter[name];
        });

        keys.map(function(name) {
            dashboardJSON.filter[name] = NocFilter.getFilter(name);
        });
        dashboardJSON.filter.startDate = filter.startDate;
        savedKeys = Object.getOwnPropertyNames(dashboardJSON.filter);
        // add suffix for widget filters
        Object.getOwnPropertyNames(filter)
        .filter(function(element) {
            return savedKeys.indexOf(element) === -1;
        }).map(function(name) {
            dashboardJSON.filter[name + dashboard.fieldNameSeparator + 'sav'] = filter[name];
        });
        dashboardJSON.export = dashboard.exportQuery;

        d3.json('/api/bi/')
        .header("Content-Type", "application/json")
        .post(
            JSON.stringify({
                id: 0,
                method: 'set_dashboard',
                params: [dashboardJSON]
            }),
            function(error) {
                console.log('save board - done, error : ' + error);
            });
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
                        filter ? dashboard.dateToString(filter[0], '%d.%b.%y') + " - " + dashboard.dateToString(filter[1], '%d.%b.%y') : '',
                        'Date',
                        'interval');
                })
                .on('pretransition', spinnerShow)
                .on('renderlet', onRenderLet);

                restoreWidgets(chart.anchorName(), true);
                $(chart.anchor()).closest(".chart-wrapper").find("img").remove();
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

                restoreWidgets(chart.anchorName(), false);
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
                var legendWidth = width - height;
                var offset = 30;

                chart
                .width(width)
                .height(height)
                .controlsUseVisibility(true)
                .innerRadius(offset)
                .dimension(dimension)
                .group(values)
                .label(function(d) {
                    return reductionName(d.key);
                })
                .legend(dc.legend()
                    // .x(width / 2 + offset / 2) // legend right
                    .x(offset) // legend left
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
                // .cx((width - height - offset) / 2) // pie left
                .cx(width - height / 2 - offset) // pie right
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

                restoreWidgets(chart.anchorName(), false);
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

                var qty = 0;

                if(!failResult(chart.anchorName(), data)) {
                    qty = data.result.result[0];
                }

                $('#qty-rows').text((qty ? formatter(qty) : '-'));
            }
        );
    };

    this.drawAll = function() {
        dashboard.setPikaBounds();
        dashboard.widgets.map(function(widget) {
            widget.draw(widget);
        });
    };

    var restoreWidgets = function(cellName, isDate) {
        var savedFilterName = Object.getOwnPropertyNames(dashboardJSON.filter).filter(function(element) {
            return element.split(dashboard.fieldNameSeparator).length === 3;
        }).filter(function(element) {
            return element.split(dashboard.fieldNameSeparator)[1] === cellName;
        });

        if(savedFilterName.length > 0) {
            if(isDate) {
                dashboard[cellName].chart.filter([
                    new Date(Date.parse(dashboardJSON.filter[savedFilterName[0]].values[0])),
                    new Date(Date.parse(dashboardJSON.filter[savedFilterName[0]].values[1]))
                ]);
            } else {
                var values = dashboard[cellName].chart.data().filter(function(element) {
                    return dashboardJSON.filter[savedFilterName[0]].values.indexOf(Number(element.key.id)) >= 0;
                });
                var text = values.map(function(element) {
                    return reductionName(element.key);
                }).join(',');

                values.map(function(element) {
                    dashboard[cellName].chart.filter(element.key);
                });
                updateWidgetTitle('#' + cellName, true, text);
            }
            delete dashboardJSON.filter[savedFilterName[0]];
        }
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
