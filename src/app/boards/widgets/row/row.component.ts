import { Component } from '@angular/core';

import * as dc from 'dc';
import * as crossfilter from 'crossfilter';
import { BaseMixin, RowChart } from 'dc';

import { WidgetComponent } from '../widget.component';
import { FilterBuilder, Result, Value } from '../../../model';
import { Utils } from '../../../shared/utils';

@Component({
    selector: 'bi-row',
    templateUrl: '../chart.wrapper.html'
})
export class RowComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<RowChart> {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const chart: RowChart = dc.rowChart(`#${this.data.cell.name}`);
        const ndx = crossfilter(response.zip(false));
        const dimension = ndx.dimension(d => new Value(d.day, days[d.day - 1]));
        const values = dimension.group().reduceSum(d => d.cnt);

        chart.width(this.wrapperView.nativeElement.scrollWidth - 10);
        chart.height(this.data.cell.height);
        chart.margins({
            top: 20,
            left: 10,
            right: 10,
            bottom: 20
        });
        chart.group(values);
        chart.dimension(dimension);
        chart.ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb']);
        chart.label(d => d.key.desc);
        chart.title(d => `${d.key.desc} : ${d.value}`);
        chart.elasticX(true);
        chart.xAxis();
        chart.controlsUseVisibility(true);
        // chart.ticks(4);
        const newFilter = new FilterBuilder()
            .name('toDayOfWeek(date)')
            .alias('days')
            .type('UInt64')
            .condition('in')
            .build();
        this.catchEvents(chart,
            newFilter,
            (widget, filter) => widget.filters().map(item => Utils.reductionName(item)).join(),
            (widget, filter) => widget.filters());
        chart.render();

        return chart;
    }
}
