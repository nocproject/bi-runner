import { Component } from '@angular/core';

import { BaseMixin, BoxPlot } from 'dc';

import { Result, Value } from '@app/model';
import { Restore, WidgetComponent } from '../widget.component';
import { EventType } from '../../filters-form/model';

@Component({
    selector: 'bi-box',
    templateUrl: '../chart.wrapper.html'
})
export class BoxPlotComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<BoxPlot> {
        // hard code two params 'duration' & 'UInt64'
        const key = 'duration';
        const type = 'UInt64';
        const chart: BoxPlot = new BoxPlot(`#${this.data.cell.name}`);
        const ndx = this.initialState(chart, response.zip(false));
        const dimension = ndx.dimension(() => key);
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

        // chart.margins({top: 50, bottom: 0, left: 0, right: 0});
        chart.yAxisLabel(null, this.yLabelOffset + 20);
        // chart.boxWidth(200);
        chart.width(this.wrapperView.nativeElement.scrollWidth);
        chart.dimension(dimension);
        chart.group(values);
        chart.elasticY(true);
        chart.elasticX(true);
        this.catchEvents(chart);
        chart.on('filtered', (widget: BaseMixin<any>) => {
            const quartiles = widget.data()[0].value['quartiles'].map(e => Math.round(e));
            const k = widget.data()[0].key;

            this.eventService.next({
                type: EventType.AddBoxplotGroup,
                payload: {key: k, type: type, quartiles: quartiles}
            });
        });
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
