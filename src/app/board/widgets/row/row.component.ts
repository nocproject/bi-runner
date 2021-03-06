import { Component } from '@angular/core';

import { BaseMixin, RowChart } from 'dc';

import { FilterBuilder, Result, Value } from '@app/model';
import { Restore, WidgetComponent } from '../widget.component';
import { Utils } from '../../../shared/utils';

@Component({
    selector: 'bi-row',
    templateUrl: '../chart.wrapper.html'
})
export class RowComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<RowChart> {
        const days = this.languageService.days;
        const chart: RowChart = new RowChart(`#${this.data.cell.name}`);
        const ndx = this.initialState(chart, response.zip(false));
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
        chart.ordering(d => d.key.value);
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
        this.catchEvents(chart, newFilter);
        chart.render();

        return chart;
    }

    getTitle(widget: BaseMixin<any>, filter): string {
        return widget.filters().map(item => Utils.reductionName(item)).join();
    }

    getValue(widget: BaseMixin<any>, filter): Value[] {
        return widget.filters();
    }

    restore(values: Value[]): Restore {
        return {
            title: values.map(item => Utils.reductionName(item)).join(),
            filter: values.map(item => new Value(item.value, item.desc))
        };
    }
}
