import { Component } from '@angular/core';

import * as crossfilter from 'crossfilter';
import * as dc from 'dc';
import { BaseMixin, Legend, PieChart } from 'dc';

import { Restore, WidgetComponent } from '../widget.component';
import { FilterBuilder, Result, Value } from '@app/model';
import { Utils } from '../../../shared/utils';

@Component({
    selector: 'bi-pie',
    templateUrl: '../chart.wrapper.html',
    styleUrls: ['../chart.wrapper.scss']
})
export class PieComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<PieChart> {
        const chart: PieChart = dc.pieChart(`#${this.data.cell.name}`);
        const ndx = crossfilter(response.zip(false));
        const dimension = ndx.dimension(d => new Value(d[Object.keys(d)[0]], d.name));
        const values = dimension.group().reduceSum(d => d.cnt);

        const width = this.wrapperView.nativeElement.scrollWidth;
        const height = this.data.cell.height - (this.isSelectable() ? 50 : 0);
        const legendWidth = width - height;
        const offset = 30;
        const legend: Legend = dc.legend();

        this.initialState(chart);

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
        this.catchEvents(chart, newFilter);
        chart.render();

        return chart;
    }

    getTitle(widget: BaseMixin<any>, filter): string {
        return widget.filters().map(item => Utils.reductionName(item)).join();
    };

    getValue(widget: BaseMixin<any>, filter): Value[] {
        return widget.filters();
    }

    restore(values: Value[]): Restore {
        return {
            title: values.map(item => Utils.reductionName(item)).join(),
            filter: values.map(item => new Value(item.value, item.desc))
        };
    }

    ngOnInit() {
        const firstFieldName = this.data.widget.query.getFirstField();
        this.funcs = [
            {value: 'count', text: 'count()'}
        ];
        this.chooseFieldForm = this.fb.group({
            name: firstFieldName,
            func: 'count'
        });

        this.fields$ = this.datasourceService.fields()
            .map(array => array
                .filter(field => field.dict && !field.pseudo && field.isSelectable)
                .map(field => {
                        if (firstFieldName === field.name) {
                            this.fieldName = this.data.widget.note = field.description;
                        }
                        return {
                            value: `${field.name}`,
                            text: field.description
                        };
                    }
                )
            );
    }

    ngOnDestroy(): void {
        this.filterSubscription.unsubscribe();
        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }
        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }
    }
}
