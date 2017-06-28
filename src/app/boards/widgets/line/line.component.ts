import { Component } from '@angular/core';

import * as dc from 'dc';
import * as d3 from 'd3';
import * as crossfilter from 'crossfilter';
import { BaseMixin, LineChart } from 'dc';

import { WidgetComponent } from '../widget.component';
import { FilterBuilder, Result, Value } from '../../../model';
import { Utils } from '../../../shared/utils';

@Component({
    selector: 'bi-line',
    templateUrl: '../chart.wrapper.html'
})
export class LineComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<LineChart> {
        const chart: LineChart = dc.lineChart(`#${this.data.cell.name}`);
        const ndx = crossfilter(response.zip(true));
        const dimension = ndx.dimension(d => d.date);
        const dim = dimension.group().reduceSum(d => d.cnt);
        let minDate, maxDate;

        if (dimension.bottom(1)[0] && dimension.top(1)[0]) {
            minDate = dimension.bottom(1)[0].date;
            maxDate = dimension.top(1)[0].date;
        } else {
            minDate = maxDate = new Date;
        }
        chart.width(this.wrapperView.nativeElement.scrollWidth);
        chart.height(this.data.cell.height);
        chart.elasticY(true);
        chart.renderHorizontalGridLines(true);
        chart.dimension(dimension);
        chart.x(d3.time.scale().domain([minDate, maxDate]));
        chart.yAxisLabel(null, this.yLabelOffset);
        chart.xAxis().tickFormat(v => d3.time.format('%d.%m')(v));
        chart.group(dim);
        chart.controlsUseVisibility(true);
        const newFilter = new FilterBuilder()
            .name('date')
            .type('Date')
            .condition('interval')
            .build();
        this.catchEvents(chart,
            newFilter,
            (widget, filter) => filter ? Utils.dateToString(filter[0], '%d.%m.%y')
                + ' - ' + Utils.dateToString(filter[1], '%d.%m.%y') : '',
            (widget, filter) => filter ? filter.map(element => new Value(element)) : []);
        chart.render();

        return chart;
    }
}