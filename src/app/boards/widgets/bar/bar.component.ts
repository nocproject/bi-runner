import { Component } from '@angular/core';

import * as dc from 'dc';
import * as d3 from 'd3';
import * as crossfilter from 'crossfilter';
import { BarChart, BaseMixin } from 'dc';

import { Restore, WidgetComponent } from '../widget.component';
import { FilterBuilder, Result, Value } from '../../../model';

@Component({
    selector: 'bi-bar',
    templateUrl: '../chart.wrapper.html'
})
export class BarComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<BarChart> {
        const chart: BarChart = dc.barChart(`#${this.data.cell.name}`);
        const ndx = crossfilter(response.zip(false));
        const dimension = ndx.dimension(d => new Value(d[Object.keys(d)[0]], d.name));
        const values = dimension.group().reduceSum(d => d.cnt);

        // this.initialState(chart);

        chart.width(this.wrapperView.nativeElement.scrollWidth);
        chart.height(this.data.cell.height);
        chart.yAxisLabel(null, this.yLabelOffset);
        chart.elasticY(true);
        chart.renderHorizontalGridLines(true);
        chart.dimension(dimension);
        chart.group(values);
        chart.x(d3.scale.linear().domain([0, 24]));
        chart.controlsUseVisibility(true);
        const newFilter = new FilterBuilder()
            .name('toHour(ts)')
            .alias('hours')
            .type('UInt8')
            .condition('interval')
            .build();
        this.catchEvents(chart, newFilter);
        chart.render();

        return chart;
    }

    getTitle(widget: BaseMixin<any>, filter): string {
        return filter ? Math.ceil(filter[0]) + ' - ' + Math.ceil(filter[1]) : '';
    }

    getValue(widget: BaseMixin<any>, filter): Value[] {
        return filter ? filter.map(element => new Value(Math.ceil(element))) : [];
    }

    restore(values: Value[]): Restore {
        return {
            title: Math.ceil(values[0].value) + ' - ' + Math.ceil(values[1].value),
            filter: values.map(item => {const s = Math.ceil(item.value);console.log(s);return s;})
        };
    }
}
