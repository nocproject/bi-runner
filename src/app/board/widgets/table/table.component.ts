import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { head, sortBy, startsWith } from 'lodash';
import { ascending, descending } from 'd3-array';
import { BaseMixin, DataTable } from 'dc';
import crossfilter from 'crossfilter';

import { Field, IOption, Result, Value } from '@app/model';
import { Restore, WidgetComponent } from '../widget.component';
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

    draw(response: Result): BaseMixin<DataTable> {
        const chart: DataTable = new DataTable(`#${this.data.cell.name}`);
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
        const sort: any = head(
            sortBy(this.data.widget.query.getFields()
                .filter(field => 'desc' in field), 'order')
                .map(field => {
                    let name = field.expr;

                    if ('alias' in field) {
                        name = field.alias;
                    }

                    return {field: name, direct: field.desc ? descending : ascending};
                })
        );

        chart.dimension(dimension);
        chart.section(() => 'click on column header to switch');
        chart.showSections(false);
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
            this.data.widget.query.setFields(
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
        this.data.widget.query.setFields(
            this.data.widget.query.getFields().filter(field => {
                const f = field.alias ? field.alias : field.expr;
                const c = col.alias ? col.alias : col.expr;
                return f !== c;
            })
        );
        this.dataReload();
    }

    addCol(): void {
        const data = this.addFieldForm.value;

        this.addSubscription = this.datasourceService.fieldByName(data.name)
            .subscribe((field: Field) => {
                this.data.widget.query.setLimit(data.limit);
                this.data.widget.query.setFields([
                    ...this.data.widget.query.getFields(),
                    this.data.widget.query.createField(data, field)
                ]);
                this.dataReload();
            });

    }

    ngOnInit() {
        this.fields$ = this.datasourceService.fields().pipe(
            map(array => array
                .filter(field => !field.pseudo)
                .filter(field => field.isSelectable)
                .map(field => {
                        return {
                            value: `${field.name}`,
                            text: field.description
                        };
                    }
                )
            )
        );
        this.formSubscription = this.addFieldForm.valueChanges
            .pipe(
                switchMap(data =>
                    this.datasourceService.fieldByName(data.name)
                        .pipe(
                            map((field: Field) => {
                                let isNumericField = false;

                                if (field) {
                                    switch (field.type) {
                                        case 'UInt8':
                                        case 'UInt16':
                                        case 'UInt32':
                                        case 'UInt64':
                                        case 'Int8':
                                        case 'Int16':
                                        case 'Int32':
                                        case 'Int64':
                                        case 'Float32':
                                        case 'Float64': {
                                            this.formats = [
                                                {value: 'intFormat', text: 'Dynamic'},
                                                {value: 'numberFormat', text: '.4f'},
                                                {value: 'secondsToString', text: '%H:%M'}
                                            ];
                                            isNumericField = true;
                                            break;
                                        }
                                        case 'Date': {
                                            this.formats = [
                                                {value: 'dateToString', text: '%d.%m.%y'}
                                            ];
                                            break;
                                        }
                                        case 'DateTime': {
                                            this.formats = [
                                                {value: 'dateToString', text: '%d.%m.%y'},
                                                {value: 'dateToDateTimeString', text: '%d.%m.%y %H:%M'},
                                                {value: 'dateToTimeString', text: '%H:%M'}
                                            ];
                                            break;
                                        }
                                        case 'IPv4': {
                                            this.formats = [
                                                {value: 'intToIP', text: 'xxx.xxx.xxx.xxx'}
                                            ];
                                            break;
                                        }
                                        default: {
                                            this.formats = [];
                                        }
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
                                    sortable: isNumericField
                                };
                            })
                        )
                )
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
}
