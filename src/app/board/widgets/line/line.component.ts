import { Component } from '@angular/core';

import { BaseMixin, LineChart } from 'dc';
import { scaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';

import { FilterBuilder, Result, Value } from '@app/model';
import { Restore, WidgetComponent } from '../widget.component';
import { Utils } from '../../../shared/utils';

@Component({
    selector: 'bi-line',
    templateUrl: '../chart.wrapper.html'
})
export class LineComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<LineChart> {
        const chart: LineChart = new LineChart(`#${this.data.cell.name}`);
        const ndx = this.initialState(chart, response.zip(true));
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
        chart.x(scaleTime().domain([minDate, maxDate]));
        chart.yAxisLabel(null, this.yLabelOffset);
        chart.xAxis().tickFormat(v => timeFormat('%d.%m')(v));
        chart.group(dim);
        chart.controlsUseVisibility(true);
        const newFilter = new FilterBuilder()
            .name('date')
            .type('Date')
            .condition('interval')
            .build();
        this.catchEvents(chart, newFilter);
        chart.render();

        return chart;
    }

    getTitle(widget: BaseMixin<any>, filter): string {
        return filter ? Utils.dateToString(filter[0], '%d.%m.%y')
            + ' - ' + Utils.dateToString(filter[1], '%d.%m.%y') : '';
    }

    getValue(widget: BaseMixin<any>, filter): Value[] {
        return filter ? [new Value(`${Utils.dateToString(filter[0], '%d.%m.%Y')} - ${Utils.dateToString(filter[1], '%d.%m.%Y')}`)] : [];

    }

    restore(values: Value[]): Restore {
        return {
            title: Utils.dateToString(new Date(values[0].value), '%d.%m.%y')
                + ' - ' + Utils.dateToString(new Date(values[1].value), '%d.%m.%y'),
            filter: [values.map(item => new Date(item.value))]
        };
    }
}
