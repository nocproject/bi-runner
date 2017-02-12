var NocAggregatePanel = (function() {
    // private var
    var formElementOdd = '<div class="form-group" style="margin-bottom: 10px;">\n    <label class="col-md-3 control-label">{name}:</label>\n    <div class="col-md-2">\n        <input type="checkbox" value="{name}" class="form-control aggregate-field"/>\n    </div>\n</div>';

    var _init = function() {
        var keys = Object.getOwnPropertyNames(dashboard.fieldsType);
        var qtyGroup = parseInt((keys.length + 1) / 2);

        for(var i = 0; i < qtyGroup; i++) {
            var $element = $(formElementOdd.replace(/{name}/g, keys[i]));

            if((qtyGroup + i) < keys.length) {
                $element.append('<label class="col-md-3 control-label">{name}:</label>\n<div class="col-md-2"><input type="checkbox" value="{name}" class="form-control aggregate-field"/></div>'.replace(/{name}/g, keys[qtyGroup + i]));
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
            onActiveCls: 'btn-primary'
        })
        .on('change', function() {
            const field = $(this).val();
            var isChecked = $(this).is(':checked');
            var removeField = function(param, name) {
                dashboard.exportQuery.params[0].fields = dashboard.exportQuery.params[0].fields.filter(function(element) {
                    return element[param] !== name;
                })
            };
            var maxGroup = function() {
                return Math.max.apply(Math,
                    dashboard.exportQuery.params[0].fields
                    .filter(function(element) {
                        return element.hasOwnProperty('group');
                    })
                    .map(function(element) {
                        return element.group;
                    }));
            };

            console.log($(this).val() + ' is checked : ' + isChecked);
            if(isChecked) {
                // add to
                // check is dictionary
                const group = maxGroup() + 1;
                var column = {expr: field, group: group};

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

                    dashboard.exportQuery.params[0].fields.push(dictionaryColumn);
                }
                if('ip' === field) {
                    dashboard.exportQuery.params[0].fields.push({
                        expr: 'IPv4NumToString(ip)',
                        alias: 'ip_str'
                    })
                }
                dashboard.exportQuery.params[0].fields.push(column);
            } else {
                // remove from
                if(dashboard.fieldsType[field].dict) {
                    removeField('alias', field + '_text');
                }
                if('ip' === field) {
                    removeField('alias', 'ip_str');
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