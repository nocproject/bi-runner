import { Component } from '@angular/core';

import { BaseMixin, GeoChoroplethChart } from 'dc';
// import { json } from 'd3-fetch';
// import { geoAlbers } from 'd3-geo'

import { FilterBuilder, Result, Value } from '@app/model';
import { Restore, WidgetComponent } from '../widget.component';

@Component({
    selector: 'bi-geo',
    templateUrl: '../chart.wrapper.html'
})
export class GeoComponent extends WidgetComponent {
    draw(response: Result): BaseMixin<GeoChoroplethChart> {
        const chart: GeoChoroplethChart = new GeoChoroplethChart(`#${this.data.cell.name}`)
            .width(this.wrapperView.nativeElement.scrollWidth)
            .height(this.data.cell.height);
        // const ndx = crossfilter(response.zip(false));
        // const dimension = ndx.dimension(d => new Value(d[Object.keys(d)[0]], d.name));
        // const values = dimension.group().reduceSum(d => d.cnt);

        const data = this.initialState(chart,[]);
        const dimension = data.dimension(d => d['state']);
        const values = dimension.group().reduceSum(d => d['value']);

        // json(`./assets/geo/${this.data.widget.map.name}.json`, (map) => {
        // const projection = geoAlbers()
        //     .rotate(this.data.widget.map.rotate)
        //     .center(this.data.widget.map.center)
        //     .parallels([52, 64])
        //     // .translate([this.wrapperView.nativeElement.scrollWidth / 2, this.data.cell.height / 2])
        //     .scale(this.data.widget.map.scale);
        //
        // chart
        //     .dimension(dimension)
        //     .group(values)
        //     .colors(['#ccc', '#E2F2FF', '#C4E4FF', '#9ED2FF', '#81C5FF', '#6BBAFF', '#51AEFF', '#36A2FF', '#1E96FF', '#0089FF'])
        //     .colorDomain([0, 200])
        //     .title(d => d.key)
        //     .projection(projection)
        //     .overlayGeoJson(map.features, 'map', d => d.properties.name);
        // chart.render();
        // });

        const newFilter = new FilterBuilder()
            .name('toHour(ts)')
            .alias('hours')
            .type('UInt8')
            .condition('interval')
            .build();
        this.catchEvents(chart, newFilter);

        return chart;
    }

    getTitle(widget: BaseMixin<any>, filter): string {
        return widget.filters().join(',');
    }

    getValue(widget: BaseMixin<any>, filter): Value[] {
        return filter ? [new Value(`${Math.ceil(filter[0])}-${Math.ceil(filter[1])}`)] : [];
    }

    restore(values: Value[]): Restore {
        return {
            title: values[0].value,
            filter: [values[0].value.split(' - ').map(item => Math.ceil(item))]
        };
    }
}
