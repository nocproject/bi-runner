import { Component } from '@angular/core';

import * as crossfilter from 'crossfilter';
import * as dc from 'dc';
import { BaseMixin, Legend, PieChart } from 'dc';

import { WidgetComponent } from '../widget.component';
import { FilterBuilder, Result, Value } from '../../../model';
import { Utils } from '../../../shared/utils';

@Component({
    selector: 'bi-pie',
    templateUrl: '../chart.wrapper.html'
})
export class PieComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<PieChart> {
        const chart: PieChart = dc.pieChart(`#${this.data.cell.name}`);
        const ndx = crossfilter(response.zip(false));
        const dimension = ndx.dimension(d => new Value(d[Object.keys(d)[0]], d.name));
        const values = dimension.group().reduceSum(d => d.cnt);

        const width = this.wrapperView.nativeElement.scrollWidth;
        const height = this.data.cell.height;
        const legendWidth = width - height;
        const offset = 30;
        const legend: Legend = dc.legend();

        // legend.x(width / 2 + offset / 2) // legend right
        legend.x(offset); // legend left
        legend.y(10);
        legend.itemHeight(13);
        legend.gap(5);
        legend.autoItemWidth(true);
        legend.legendWidth(legendWidth);
        legend.itemWidth(legendWidth - 5);
        legend.legendText(d => d.name.desc);

        chart.width(width);
        chart.height(height);
        chart.innerRadius(offset);
        chart.dimension(dimension);
        chart.group(values);
        chart.label(d => Utils.reductionName(d.key));
        chart.legend(legend);
        // .cx((width - height - offset) / 2) // pie left
        chart.cx(width - height / 2 - offset); // pie right
        chart.title(d => `${d.key.desc} : ${d.value}`);
        chart.controlsUseVisibility(true);
        const newFilter = new FilterBuilder()
            .name(this.data.widget.query.getFirstField())
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
