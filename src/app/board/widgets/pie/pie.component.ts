import { Component } from '@angular/core';

import { map } from 'rxjs/operators';

import { select } from 'd3-selection';
import * as dc from 'dc';
import { BaseMixin, Legend, legend, PieChart } from 'dc';

import { FilterBuilder, Result, Value } from '@app/model';
import { Restore, WidgetComponent } from '../widget.component';
import { Utils } from '../../../shared/utils';

@Component({
    selector: 'bi-pie',
    templateUrl: '../chart.wrapper.html',
    styleUrls: ['../chart.wrapper.scss']
})
export class PieComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<PieChart> {
        const chart: PieChart = new PieChart(`#${this.data.cell.name}`);
        const ndx = this.initialState(chart, response.zip(false));
        const dimension = ndx.dimension(d => new Value(d[Object.keys(d)[0]], d.name));
        const values = dimension.group().reduceSum(d => d['cnt']);

        const width = this.wrapperView.nativeElement.scrollWidth;
        const height = this.data.cell.height - (this.isSelectable() ? 50 : 0);
        const legendWidth = width - 1.5 * height;
        const offset = 30;
        const legend: Legend = dc.legend();

        // legend.x(width / 2 + offset / 2) // legend right
        legend.x(offset); // legend left
        legend.y(10);
        legend.itemHeight(13);
        legend.gap(5);
        legend.autoItemWidth(true);
        legend.legendText(function (d) {
            const self = select(this);
            self.text(d.name.desc);
            let textLength = this.getComputedTextLength();
            let text = self.text();
            while (textLength > legendWidth && text.length > 0) {
                text = text.slice(0, -1);
                self.text(text + '...');
                textLength = this.getComputedTextLength();
            }
            return self.text();
        });

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
            .pipe(
                map(array => array
                    .filter(field => (field.dict || field.allowAggFuncs) && !field.pseudo && field.isSelectable)
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
