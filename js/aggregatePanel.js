var NocAggregatePanel = (function() {
    // private var
    var formElementOdd = {gulp_inject: './templates/aggregate-element-odd.html'};

    var _init = function() {
        var i, len, qtyGroup;
        var keys = Object.getOwnPropertyNames(dashboard.fieldsType).filter(function(name) {
            return dashboard.agv_fields.filter(function(element) {
                    return element.name === name;
                }).length > 0;
        });
        var fields = keys.map(function(key) {
            var field = dashboard.agv_fields.filter(function(element) {
                return element.name === key;
            })[0];

            field['description'] = dashboard.fieldsType[key].description;

            return field;
        })
        .sort(function(a, b) {
            var desc1 = a.group + a.description ? a.group + a.description : a.group + 'z';
            var desc2 = b.group + b.description ? b.group + b.description : b.group + 'z';

            return desc1.localeCompare(desc2);
        });
        var $aggregate = $('.aggregate-by-field');
        var insertIdx = [];

        // insert hr
        len = fields.length;
        for(i = 1; i < len; i += 1) {
            if(fields[i - 1].group !== fields[i].group) {
                insertIdx.push(i);
            }
        }
        len = insertIdx.length;
        for(i = 0; i < len; i++) {
            fields.splice(i + insertIdx[i], 0, {name: 'hr'});
        }

        qtyGroup = parseInt((fields.length + 1) / 2);

        for(i = 0; i < qtyGroup; i++) {
            var $element;

            if('hr' === fields[i].name) {
                $element = $('<div class="form-group" style="margin-bottom: 10px;"><div class="col-md-5"></div></div>');
            } else {
                $element = $(formElementOdd
                    .replace(/{name}/g, fields[i].name)
                    .replace(/{description}/g, fields[i].description)
                );
            }

            if((qtyGroup + i) < fields.length) {
                if('hr' === fields[qtyGroup + i].name) {
                    $element.append('<div class="col-md-5"></div>');
                } else {
                    $element.append('<label class="col-md-3 control-label">{description}:</label>\n<div class="col-md-2"><input type="checkbox" value="{name}" class="form-control aggregate-field"/></div>'
                        .replace(/{name}/g, fields[qtyGroup + i].name)
                        .replace(/{description}/g, fields[qtyGroup + i].description)
                    );
                }
            }
            $aggregate.append($element);
        }

        dashboard.exportQuery.params[0].fields.map(function(field) {
            if(field.hasOwnProperty('group')) {
                $('.aggregate-by-field').find("input[value='" + field.expr + "']")
                .attr('checked', 'checked');
            }
        });

        $('.aggregate-field').checkboxpicker({
            offActiveCls: 'btn-default',
            offLabel: __('No'),
            onActiveCls: 'btn-primary',
            onLabel: __('Yes')
        })
        .on('change', function() {
            const field = $(this).val();
            var isChecked = $(this).is(':checked');
            var removeField = function(param, name) {
                dashboard.exportQuery.params[0].fields = dashboard.exportQuery.params[0].fields.filter(function(element) {
                    return element[param] !== name;
                })
            };
            var _maxGroup = function() {
                var maxGroup = Math.max.apply(Math,
                    dashboard.exportQuery.params[0].fields
                    .filter(function(element) {
                        return element.hasOwnProperty('group');
                    })
                    .map(function(element) {
                        return element.group;
                    }));
                return (maxGroup === -Infinity || isNaN(maxGroup)) ? 0 : maxGroup;
            };

            console.log($(this).val() + ' is checked : ' + isChecked);
            if(isChecked) {
                // add to
                // check is dictionary
                var column = {expr: field, group: _maxGroup() + 1};

                if(dashboard.fieldsType[field].dict) {
                    var dictionaryColumn = {
                        expr: {
                            $lookup: [
                                dashboard.fieldsType[field].dict,
                                {
                                    $field: field
                                }
                            ]
                        },
                        alias: field + '_text'
                    };
                    column.hide = 'yes';
                    dashboard.exportQuery.params[0].fields.push(dictionaryColumn);
                }
                if('ip' === field) {
                    dashboard.exportQuery.params[0].fields.push({
                        expr: 'IPv4NumToString(ip)',
                        alias: 'ip_text'
                    })
                }
                dashboard.exportQuery.params[0].fields.push(column);
            } else {
                // remove from
                if(dashboard.fieldsType[field].dict) {
                    removeField('alias', field + '_text');
                }
                if('ip' === field) {
                    removeField('alias', 'ip_text');
                }
                removeField('expr', field);
            }
            dashboard['row-counter'].query.params[0].fields = _counterField();
            dashboard.counter(dashboard['row-counter']);
        });
    };

    var _counterField = function() {
        var groupedFields = function() {
            return dashboard.exportQuery
                .params[0].fields
            .filter(function(field) {
                return field.hasOwnProperty('group');
            })
            .map(function(field) {
                return field.expr;
            }).join(',');
        };

        return [
            {
                expr: 'uniq(' + groupedFields() + ')',
                alias: 'qty'
            }
        ]
    };

    // public
    return {
        init: _init,
        counterField: _counterField
    }
})();