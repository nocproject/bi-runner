import { Component } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import * as _ from 'lodash';
import * as d3 from 'd3';
import * as dc from 'dc';
import { BaseMixin, DataTableWidget } from 'dc';
import * as crossfilter from 'crossfilter';

import { Restore, WidgetComponent } from '../widget.component';
import { Field, Result, Value } from '@app/model/index';
import { Utils } from '../../shared/utils';

@Component({
    selector: 'bi-table',
    templateUrl: './table.component.html'
})
export class TableComponent extends WidgetComponent {
    private sortSubscription: Subscription;

    draw(response: Result): BaseMixin<DataTableWidget> {
        const chart: DataTableWidget = dc.dataTable(`#${this.data.cell.name}`);
        const ndx = crossfilter(response.zip(true));
        const dimension = ndx.dimension(d => d.date);
        const cols = this.data.widget.query.getLabeledFields()
            .map((field: Field) => {
                const param = field.alias ? field.alias : field.expr.toString();

                if ('format' in field) {
                    return (d) => Utils[field.format](d[param]);
                } else {
                    return (d) => d[param];
                }
            });
        const sort = _.head(
            this.data.widget.query.getFields()
                .filter(field => 'desc' in field)
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
            chart.sortBy(d => parseInt(d[sort.field], 10));
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
            this.sortSubscription = this.api.execute(this.data.widget.query)
                .subscribe(
                    (response: Result) => {
                        this.chart = this.draw(response);
                    },
                    console.error);
        }
    }

    ngOnDestroy(): void {
        this.filterSubscription.unsubscribe();
        if (this.sortSubscription) {
            this.sortSubscription.unsubscribe();
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
