import { Component } from '@angular/core';

import * as _ from 'lodash';
import * as d3 from 'd3';
import * as dc from 'dc';
import { BaseMixin, DataTableWidget } from 'dc';
import * as crossfilter from 'crossfilter';

import { Restore, WidgetComponent } from '../widget.component';
import { Field, Result, Value } from '../../../model';
import { Utils } from '../../../shared/utils';

@Component({
    selector: 'bi-table',
    templateUrl: './table.component.html'
})
export class TableComponent extends WidgetComponent {
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
