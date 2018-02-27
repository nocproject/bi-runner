import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import { head, isEmpty, max, sortBy, startsWith } from 'lodash';
import * as d3 from 'd3';
import * as dc from 'dc';
import { BaseMixin, DataTableWidget } from 'dc';
import * as crossfilter from 'crossfilter';

import { Restore, WidgetComponent } from '../widget.component';
import { Field, FieldBuilder, IOption, Result, Value } from '@app/model';
import { Utils } from '../../../shared/utils';

@Component({
    selector: 'bi-table',
    styleUrls: ['../chart.wrapper.scss'],
    templateUrl: './table.component.html'
})
export class TableComponent extends WidgetComponent {
    formats: IOption[];
    addFieldForm: FormGroup = this.fb.group({
        name: '',
        label: '',
        format: '',
        limit: 10,
        sortable: new FormControl({value: false, disabled: true})
    });
    private addSubscription: Subscription;

    draw(response: Result): BaseMixin<DataTableWidget> {
        const chart: DataTableWidget = dc.dataTable(`#${this.data.cell.name}`);
        const ndx = crossfilter(response.zip(false));
        const dimension = ndx.dimension(d => d.date);
        const cols = this.data.widget.query.getLabeledFields()
            .map((field: Field) => {
                const param = field.alias ? field.alias : field.expr.toString();

                if ('format' in field) {
                    return (d) => {
                        let val = d[param];

                        if (startsWith(field.format, 'dateTo')) {
                            val = new Date(Date.parse(val));
                        }

                        return Utils[field.format](val);
                    };
                } else {
                    return (d) => d[param];
                }
            });
        const sort = head(
            sortBy(this.data.widget.query.getFields().filter(field => 'desc' in field), 'order')
                .map(field => {
                    if (field.desc) {
                        return {field: 'alias' in field ? field.alias : field.expr, direct: d3.descending};
                    }
                    return {field: 'alias' in field ? field.alias : field.expr, direct: d3.ascending};
                })
        );

        chart.dimension(dimension);
        chart.group(() => 'click on column header to switch');
        chart.showGroups(false);
        chart.columns(cols);
        if (sort) {
            chart.sortBy(d => parseFloat(d[sort.field]));
            chart.order(sort.direct);
        }
        this.catchEvents(chart);
        chart.render();

        return chart;
    }

    sort(column: Field): void {
        if ('desc' in column) {
            const fields = this.data.widget.query.getFields().map(field => {
                if ('desc' in field) {
                    field.order = ++field.order;
                }
                if (field.alias === column.alias || field.expr === column.expr) {
                    field.desc = !field.desc;
                    field.order = 0;
                }
                return field;
            });
            const mapper = fields.filter(f => 'order' in f).map(f => f.order).sort();
            this.data.widget.query.setField(
                fields.map(f => {
                    if ('order' in f) {
                        f.order = mapper.indexOf(f.order) + 1;
                    }
                    return f;
                })
            );
            this.dataReload();
        }
    }

    removeCol(col: Field): void {
        this.data.widget.query.setField(
            this.data.widget.query.getFields().filter(f => f.alias !== col.alias)
        );
        this.dataReload();
    }

    addCol(): void {
        const data = this.addFieldForm.value;

        this.addSubscription = this.datasourceService.fieldByName(data.name)
            .subscribe((field: Field) => {
                let alias = data.name;
                let expr = data.name;
                const sortable = data.sortable || false;
                const fieldQty = this.data.widget.query.getFields().filter(field => startsWith(field.alias, alias)).length;

                if (fieldQty) {
                    alias += `${fieldQty}`;
                }

                if (startsWith(field.type, 'dict-') || startsWith(field.type, 'tree-')) {
                    expr = {
                        '$lookup': [
                            field.dict,
                            {
                                '$field': data.name
                            }
                        ]
                    };
                }

                if (field.isAgg) {
                    const prop = `$${field.aggFunc}Merge`;
                    expr = {};
                    expr[prop] = [
                        {
                            '$field': `${data.name}_${field.aggFunc}`
                        }
                    ];
                }

                const newField: Field = new FieldBuilder()
                    .expr(expr)
                    .alias(alias)
                    .label(data.label)

                    .build();

                if (data.format) {
                    newField.format = data.format;
                }

                if (sortable) {
                    let maxOrder = max(this.data.widget.query
                        .getFields()
                        .filter(field => 'desc' in field)
                        .map(field => field.order));

                    if (!maxOrder) {
                        maxOrder = 0;
                    }
                    newField.desc = true;
                    newField.order = maxOrder + 1;
                }

                this.data.widget.query.setLimit(data.limit);
                this.data.widget.query.setField([
                    ...this.data.widget.query.getFields(),
                    newField
                ]);
                this.dataReload();
            });

    }

    ngOnInit() {
        this.cellClass = this.data.cell.getClasses();
        this.fields$ = this.datasourceService.fields()
            .map(array => array
                .filter(field => !field.pseudo)
                .filter(field => field.isSelectable)
                .map(field => {
                        return {
                            value: `${field.name}`,
                            text: field.description
                        };
                    }
                )
            );
        this.formSubscription = this.addFieldForm.valueChanges.switchMap(data =>
            this.datasourceService.fieldByName(data.name)
                .map((field: Field) => {
                    if (field) {
                        if (TableComponent.isNumeric(field)) {
                            this.formats = [
                                {value: 'intFormat', text: 'Dynamic'},
                                {value: 'numberFormat', text: '.4f'},
                                {value: 'secondsToString', text: '%H:%M'}
                            ];
                        } else if (field.type === 'DateTime') {
                            this.formats = [
                                {value: 'dateToString', text: '%d.%m.%y'},
                                {value: 'dateToDateTimeString', text: '%d.%m.%y %H:%M'},
                                {value: 'dateToTimeString', text: '%H:%M'}
                            ];
                        } else if (field.type === 'Date') {
                            this.formats = [
                                {value: 'dateToString', text: '%d.%m.%y'}
                            ];
                        } else if (field.type === 'IPv4') {
                            this.formats = [
                                {value: 'intToIP', text: 'xxx.xxx.xxx.xxx'}
                            ];
                        } else {
                            this.formats = [];
                        }
                        if (this.formats.filter(fm => fm.value === data.format).length === 0) {
                            this.addFieldForm.patchValue({format: ''}, {emitEvent: false});
                        }
                    }
                    return {
                        label: data.label,
                        name: data.name,
                        limit: data.limit,
                        format: data.format,
                        sortable: TableComponent.isNumeric(field)
                    };
                })
        ).subscribe(data => {
            if (data.sortable) {
                this.addFieldForm.get('sortable').enable({emitEvent: false, onlySelf: true});
            } else {
                this.addFieldForm.get('sortable').disable({emitEvent: false, onlySelf: true});
                this.addFieldForm.patchValue({sortable: false}, {emitEvent: false});
            }
        });
    }

    ngOnDestroy(): void {
        this.filterSubscription.unsubscribe();
        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }
        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }
        if (this.addSubscription) {
            this.addSubscription.unsubscribe();
        }
    }

    getTitle(widget: BaseMixin<any>, filter): string {
        return undefined;
    }

    getValue(widget: BaseMixin<any>, filter: any): any[] {
        return undefined;
    }

    restore(values: Value[]): Restore {
        return undefined;
    }

    private static isNumeric(field: Field): boolean {
        if (isEmpty(field)) return false;
        return ['UInt8', 'UInt16', 'UInt32', 'UInt64', 'Int8', 'Int16', 'Int32', 'Int64', 'Float32', 'Float64'].indexOf(field.type) !== -1;
    }
}
