import { Component } from '@angular/core';

import * as dc from 'dc';
import { BaseMixin, SelectMenu } from 'dc';
import * as crossfilter from 'crossfilter';

import { Restore, WidgetComponent } from '../widget.component';
import { FilterBuilder, Result, Value } from '../../../model';
import * as d3 from 'd3';

@Component({
    selector: 'bi-menu',
    templateUrl: '../chart.wrapper.html'
})
export class SelectorMenuComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<SelectMenu> {
        const chart: SelectMenu = dc.selectMenu(`#${this.data.cell.name}`);
        const ndx = crossfilter(response.zip(false));
        const dimension = ndx.dimension(d => d.date);
        const values = dimension.group().reduceSum(d => d.cnt);

        this.initialState(chart);

        chart.dimension(dimension);
        chart.group(values);
        chart.multiple(true);
        chart.numberVisible(10);
        chart.promptText(undefined);
        const newFilter = new FilterBuilder()
            .name('ts')
            .type('DateTime')
            .condition('in')
            .build();
        this.catchEvents(chart, newFilter);
        chart.render();

        return chart;
    }

    getTitle(widget: BaseMixin<any>, filter): string {
        return widget.filters().join(', ');
    }

    getValue(widget: BaseMixin<any>, filter): Value[] {
        return widget.filters().map(d => new Value(d3.time.format('%Y-%m-%d %H:%M:%S').parse(d)));
    }

    restore(values: Value[]): Restore {
        console.log(values);
        return {
            title: values.map(item => d3.time.format('%Y-%m-%d %H:%M:%S')(item.value)).join(', '),
            filter: values.map(item => new Value(item.value, item.desc))
        };
    }

}