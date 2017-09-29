var NocDialog = (function() {
    var dialogType = BootstrapDialog.TYPE_PRIMARY;

    var _load = function() {
        var formatter = function(value) {
            return dashboard.dateToString(new Date(value), '%d.%m.%y %H:%M');
        };

        $('#reports-list').bootstrapTable({
            url: '/api/bi/',
            method: 'POST',
            dataType: 'json',
            ajaxOptions: {
                converters: {
                    "text json": function(value) {
                        return {
                            data: jQuery.parseJSON(value).result
                        }
                    }
                }
            },
            queryParams: JSON.stringify({
                params: [{version: 1}],
                id: 0,
                method: 'list_dashboards'
            }),
            columns: [
                {
                    checkbox: true
                }, {
                    field: 'title',
                    title: __('Name'),
                    sortable: true
                }, {
                    field: 'description',
                    title: __('Description'),
                    sortable: true
                }, {
                    field: 'owner',
                    title: __('Owner'),
                    sortable: true
                }, {
                    field: 'created',
                    title: __('Created'),
                    formatter: formatter,
                    sortable: true
                }, {
                    field: 'changed',
                    title: __('Changed'),
                    formatter: formatter,
                    sortable: true
                }
            ],
            singleSelect: true,
            clickToSelect: true,
            maintainSelected: true,
            checkboxHeader: false,
            pagination: true,
            search: true,
            iconSize: 'btn-xs',
            onLoadSuccess: function() {
                $('#reports-list').bootstrapTable('hideLoading');
            },
            // onDblClickRow: function(row) {
            //     _openReport(row);
            // },
            formatLoadingMessage: function() {
                return __('Loading, please wait...');
            },
            formatRecordsPerPage: function(pageNumber) {
                return pageNumber + ' ' + __('rows per page');
            },
            formatShowingRows: function(pageFrom, pageTo, totalRows) {
                return __('Showing') + ' ' + pageFrom + ' ' + __('to') + ' ' + pageTo + ' ' + __('of') + ' ' + totalRows + ' ' + __('rows');
            },
            formatSearch: function() {
                return __('Search');
            },
            formatNoMatches: function() {
                return __('No matching records found');
            },
            formatPaginationSwitch: function() {
                return __('Hide/Show pagination');
            },
            formatRefresh: function() {
                return __('Refresh');
            },
            formatToggle: function() {
                return __('Toggle');
            },
            formatColumns: function() {
                return __('Columns');
            },
            formatAllRows: function() {
                return __('All');
            },
            formatExport: function() {
                return __('Export data');
            },
            formatClearFilters: function() {
                return __('Clear filters');
            }
        });
    };

    var _selectReport = function() {
        BootstrapDialog.show({
            title: __('Select Report'),
            type: dialogType,
            size: BootstrapDialog.SIZE_WIDE,
            message: $('<table id="reports-list"></table>'),
            onshown: _load,
            buttons: [
                {
                    label: __('Cancel'),
                    action: function(dialog) {
                        dialog.close();
                    }
                },
                {
                    label: __('Open'),
                    action: function(dialog) {
                        _openReport(dialog, $('#reports-list').bootstrapTable('getSelections')[0]);
                    }
                }
            ]
        });
    };

    var _saveAsReport = function() {
        BootstrapDialog.show({
            title: __('Save As Report'),
            type: dialogType,
            message: __('Name') + ': <input id="save-report-name" type="text" class="form-control">' + __('Description') +
            ': <textarea id="save-report-desc" class="form-control" placeholder="' + 'Description' + '"></textarea>',
            onshown: function() {
                $('#save-report-name').val(dashboard.title);
                $('#save-report-desc').text(dashboard.description);
            },
            buttons: [
                {
                    label: __('Cancel'),
                    action: function(dialog) {
                        dialog.close();
                    }
                },
                {
                    label: __('Save'),
                    action: function(dialog) {
                        dashboard.saveBoard($('#save-report-name').val(), $('#save-report-desc').text());
                        $('#report-name').text(dashboardJSON.title);
                        dialog.close();
                    }
                }
            ]
        })
    };

    var _openReport = function(dialog, row) {
        if(row) {
            $(location).attr('search','?id=' + row.id);
            dialog.close();
        } else {
            BootstrapDialog.show({
                title: __('Error'),
                type: BootstrapDialog.TYPE_DANGER,
                message: __('You must choose report!'),
                closable: false,
                buttons: [{
                    label: __('Ok'),
                    action: function(dialog) {
                        dialog.close();
                    }
                }]
            });
        }
    };

    var _aboutDlg = function() {
        BootstrapDialog.show({
            title: __('Application NOC BI'),
            type: dialogType,
            message: '<p>NOC BI ' + __('version') + ' 0.0.0.0</p><small>Copyright © 2007-2017, The NOC Project</small>',
            buttons: [{
                label: __('Close'),
                action: function(dialog) {
                    dialog.close();
                }
            }]
        });
    };

    return {
        selectReportDlg: _selectReport,
        saveAsReportDlg: _saveAsReport,
        aboutDlg: _aboutDlg
    }
})();