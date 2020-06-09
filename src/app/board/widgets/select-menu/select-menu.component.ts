import { Component } from '@angular/core';

import { last } from 'lodash';
import { timeFormat, timeParse } from 'd3-time-format';
import { BaseMixin, SelectMenu } from 'dc';

import { FilterBuilder, Result, Value } from '@app/model';
import { Restore, WidgetComponent } from '../widget.component';

@Component({
    selector: 'bi-menu',
    templateUrl: '../chart.wrapper.html'
})
export class SelectMenuComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<SelectMenu> {
        const prompt = this.languageService.selectMenuPrompt;
        // @ts-ignore
        const chart: SelectMenu = new SelectMenu(`#${this.data.cell.name}`);
        const ndx = this.initialState(chart, response.zip(false));
        const dimension = ndx.dimension(d => d.date);
        const values = dimension.group().reduceSum(d => d.cnt);
        const data: any = values.all();

        if (data.length) {
            chart.filter(last(data)['key']);
        }
        chart.dimension(dimension);
        chart.group(values);
        chart.multiple(true);
        chart.numberVisible(10);
        chart.promptText(prompt);
        // chart.filterDisplayed((d, b) =>
        //     d.value < 3000
        // );
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
        return widget.filters()
            .filter(d => d.length)
            .join(', ');
    }

    getValue(widget: BaseMixin<any>, filter): Value[] {
        return widget.filters()
            .filter(d => d.length)
            .map(d => new Value(timeParse('%Y-%m-%d %H:%M:%S')(d)));
    }

    restore(values: Value[]): Restore {
        return {
            title: values.map(item => timeFormat('%Y-%m-%d %H:%M:%S')(item.value)).join(', '),
            filter: values.map(item => new Value(item.value, item.desc))
        };
    }

}
