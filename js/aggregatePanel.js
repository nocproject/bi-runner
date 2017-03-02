var NocAggregatePanel = (function() {
    // private var
    var formElementOdd = { gulp_inject: './templates/aggregate-element-odd.html' };

    var _init = function() {
        var keys = Object.getOwnPropertyNames(dashboard.fieldsType).filter(function(name) {
            return dashboard.agv_fields.indexOf(name) !== -1;
        });
        var qtyGroup = parseInt((keys.length + 1) / 2);

        for(var i = 0; i < qtyGroup; i++) {
            var $element = $(formElementOdd
                .replace(/{name}/g, keys[i])
                .replace(/{description}/g, dashboard.fieldsType[keys[i]].description)
            );

            if((qtyGroup + i) < keys.length) {
                $element.append('<label class="col-md-3 control-label">{description}:</label>\n<div class="col-md-2"><input type="checkbox" value="{name}" class="form-control aggregate-field"/></div>'
                .replace(/{name}/g, keys[qtyGroup + i])
                .replace(/{description}/g, dashboard.fieldsType[keys[qtyGroup + i]].description)
                );
            }
            $('.aggregate-by-field').append($element);
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