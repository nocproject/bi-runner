import { Component } from '@angular/core';

import * as dc from 'dc';
import { BaseMixin, BoxPlot } from 'dc';
import * as crossfilter from 'crossfilter';

import { Restore, WidgetComponent } from '../widget.component';
import { Result, Value } from 'app/model';

@Component({
    selector: 'bi-box',
    templateUrl: '../chart.wrapper.html'
})
export class BoxPlotComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<BoxPlot> {
        const chart: BoxPlot = dc.boxPlot(`#${this.data.cell.name}`);
        const ndx = crossfilter(response.zip(false));
        const dimension = ndx.dimension(() => 'duration');
        const values = dimension.group().reduce(
            (p, v) => {
                p.push(parseInt(v.d));
                return p;
            },
            (p, v) => {
                p.splice(p.indexOf(parseInt(v.d)), 1);
                return p;
            },
            () => []);

        this.initialState(chart);

        // chart.margins({top: 50, bottom: 0, left: 0, right: 0});
        chart.yAxisLabel(null, this.yLabelOffset + 20);
        // chart.boxWidth(200);
        chart.width(this.wrapperView.nativeElement.scrollWidth);
        chart.dimension(dimension);
        chart.group(values);
        chart.elasticY(true);
        chart.elasticX(true);
        // chart.tickFormat(d3.format('.2f'));
        this.catchEvents(chart);
        chart.render();

        return chart;
    }

    getTitle(widget: BaseMixin<BoxPlot>, filter): string {
        return undefined;
    }

    getValue(widget: BaseMixin<BoxPlot>, filter): Value[] {
        return undefined;
    }

    restore(values: Value[]): Restore {
        return undefined;
    }
}