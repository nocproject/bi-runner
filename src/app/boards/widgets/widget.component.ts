import { AfterViewInit, ElementRef, forwardRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { BaseMixin } from 'dc';

import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';

import { CellAndWidget, GroupBuilder, Filter, Result, Value, WhereBuilder } from '../../model';
import { APIService, FilterService } from '../../services';

export abstract class WidgetComponent implements AfterViewInit, OnInit, OnDestroy {
    private subscription: Subscription;
    // private eventSubscription: Subscription;

    @Input()
    data: CellAndWidget;
    @ViewChild('wrapper') wrapperView: ElementRef;
    chart: BaseMixin<any>;
    title: string;
    cellClass: string;
    showSpinner = true;
    showReset = false;
    // default values
    yLabelOffset = 20;

    constructor(@Inject(forwardRef(() => APIService)) private api: APIService,
                @Inject(forwardRef(() => FilterService)) private filterService: FilterService) {
    }

    ngAfterViewInit(): void {
        this.filtersSubscription();
    }

    ngOnInit() {
        this.filterService.lastUpdatedWidget = '';
        this.cellClass = this.data.cell.getClasses();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    catchEvents(chart: BaseMixin<any>, nextFilter?: Filter): void {
        chart.on('filtered', (widget: BaseMixin<any>, filter) => {
            const key = `${nextFilter.alias ? nextFilter.alias : nextFilter.name}.${chart.anchorName()}`;

            this.showReset = true;
            this.title = this.getTitle(widget, filter);
            nextFilter.values = this.getValue(widget, filter);
            if (nextFilter.isEmpty()) {
                this.filterService.lastUpdatedWidget = '';
            } else {
                this.filterService.lastUpdatedWidget = chart.anchorName();
            }
            this.filterService.filtersNext(new GroupBuilder().name(key).filters([nextFilter]).build());
        });

        // spinner on/off
        chart.on('pretransition', () => this.showSpinner = true);
        chart.on('renderlet', () => this.showSpinner = false);
    }

    initialState(widget: BaseMixin<any>) {
        const cell = widget.anchorName();
        const values: Value[] = this.filterService.initChart(cell);

        if (values) {
            const data = this.restore(values);

            data.filter.forEach(f => widget.filter(f));
            this.title = data.title;
            this.showReset = true;
        }
    }

    onReset(): void {
        this.chart.filterAll();
        this.chart.render();
        this.showReset = false;
    }

    abstract draw(response: Result): BaseMixin<any>;

    abstract getTitle(widget: BaseMixin<any>, filter): string;

    abstract getValue(widget: BaseMixin<any>, filter): Value[];

    abstract restore(values: Value[]): Restore;

    private filtersSubscription() {
        this.subscription = this.filterService.filters$
            .debounceTime(500)
            // .distinctUntilChanged()
            // .do(data => console.log('filters changed', data))
            .filter(() => this.filterService.lastUpdatedWidget !== this.data.widget.cell)
            .map(group => WhereBuilder.makeWhere(group))
            .filter(where => JSON.stringify(where) !== JSON.stringify(this.data.widget.query.params[0].filter))
            .switchMap(updated => {
                if (updated) {
                    this.data.widget.query.params[0].filter = updated;
                } else {
                    delete this.data.widget.query.params[0].filter;
                }
                return this.api.execute(this.data.widget.query);
            })
            .subscribe(
                (response: Result) => {
                    // ToDo restore chart state from filter, by prefix '.sav'
                    // _.endsWith(
                    // _.startsWith(
                    // console.log(`updating: ${this.data.widget.cell}`);
                    // console.log(`${this.data.widget.cell} => ${response.result.sql}`);
                    this.chart = this.draw(response);
                },
                console.error);
    }
}

export interface Restore {
    title: string;
    filter: any[];
}