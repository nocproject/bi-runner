import { AfterViewInit, ElementRef, forwardRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { BaseMixin } from 'dc';
import { clone, startsWith } from 'lodash';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime, filter, map, switchMap } from 'rxjs/operators';

import {
    CellAndWidget,
    Field,
    FieldBuilder,
    Filter,
    GroupBuilder,
    IOption,
    Result,
    Value,
    WhereBuilder
} from '@app/model';
import { APIService, LanguageService } from '@app/services';
import { FilterService } from '../services/filter.service';
import { EventService } from '../services/event.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatasourceService } from '../services/datasource-info.service';

export abstract class WidgetComponent implements AfterViewInit, OnInit, OnDestroy {
    @Input()
    data: CellAndWidget;
    @ViewChild('wrapper') wrapperView: ElementRef;
    chart: BaseMixin<any>;
    title: string;
    showSpinner = true;
    showReset = false;
    // default values
    yLabelOffset = 20;
    protected filterSubscription: Subscription;
    protected reloadSubscription: Subscription;
    protected formSubscription: Subscription;
    chooseFieldForm: FormGroup;
    fields$: Observable<IOption[]>;
    funcs: IOption[];
    fieldName: string;

    constructor(@Inject(forwardRef(() => FormBuilder)) protected fb: FormBuilder,
                @Inject(forwardRef(() => DatasourceService)) protected datasourceService: DatasourceService,
                @Inject(forwardRef(() => APIService)) protected api: APIService,
                @Inject(forwardRef(() => FilterService)) protected filterService: FilterService,
                @Inject(forwardRef(() => EventService)) protected eventService: EventService,
                @Inject(forwardRef(() => LanguageService)) protected languageService: LanguageService) {
    }

    ngAfterViewInit(): void {
        this.filtersSubscription();
    }

    ngOnInit() {
        this.filterService.lastUpdatedWidget = '';
    }

    ngOnDestroy(): void {
        this.filterSubscription.unsubscribe();
    }

    catchEvents(chart: BaseMixin<any>, nextFilter?: Filter): void {
        if (nextFilter) {
            chart.on('filtered', (widget: BaseMixin<any>, filter) => {
                const key = `${nextFilter.alias ? nextFilter.alias : nextFilter.name}.${chart.anchorName()}`;

                this.showReset = true;
                this.title = this.getTitle(widget, filter);
                nextFilter.values = this.getValue(widget, filter);
                if (nextFilter.isEmpty()) {
                    this.filterService.lastUpdatedWidget = '';
                    this.showReset = false;
                } else {
                    this.filterService.lastUpdatedWidget = chart.anchorName();
                }
                this.filterService.filtersNext(new GroupBuilder().name(key).filters([nextFilter]).build());
            });
        }
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

    isSelectable(): boolean {
        return startsWith(this.data.widget.type, 'selectable');
    }

    dataReload() {
        this.reloadSubscription = this.api.execute(this.data.widget.query)
            .subscribe((response: Result) => {
                    if (!response.result) {
                        response.result = {fields: [], result: []};
                    }
                    this.chart = this.draw(response);
                },
                console.error);
    }

    chooseCol(): void {
        const data = this.chooseFieldForm.value;

        this.formSubscription = this.datasourceService.fieldByName(data.name)
            .subscribe((field: Field) => {
                const fields: Field[] = [
                    new FieldBuilder()
                        .expr(data.name)
                        .group(0)
                        .build(),
                    new FieldBuilder()
                        .expr({
                            '$lookup': [
                                field.dict,
                                {
                                    '$field': data.name
                                }
                            ]
                        })
                        .group(1)
                        .alias('name')
                        .build(),
                    new FieldBuilder()
                        .expr(`${data.func}()`)
                        .alias('cnt')
                        .order(0)
                        .desc(true)
                        .build()
                ];

                this.chart.filterAll();
                this.fieldName = this.data.widget.note = clone(field.description);
                this.data.widget.query.setField(fields);
                this.dataReload();
            });
    }

    abstract draw(response: Result): BaseMixin<any>;

    abstract getTitle(widget: BaseMixin<any>, filter): string;

    abstract getValue(widget: BaseMixin<any>, filter): Value[];

    abstract restore(values: Value[]): Restore;

    private filtersSubscription() {
        this.filterSubscription = this.filterService.filters$
            .pipe(
                debounceTime(500),
                // .distinctUntilChanged()
                // .do(data => console.log('filters changed', data))
                filter(() => this.filterService.lastUpdatedWidget !== this.data.widget.cell),
                map(group => {
                    return {
                        filter: WhereBuilder.makeWhere(group, true),
                        having: WhereBuilder.makeWhere(group, false)
                    };
                }),
                filter(conditions => {
                    return (JSON.stringify(conditions.filter) !== JSON.stringify(this.data.widget.query.params[0].filter))
                        || (JSON.stringify(conditions.having) !== JSON.stringify(this.data.widget.query.params[0].having));
                }),
                switchMap(conditions => {
                    this.setConstraint(conditions, 'filter');
                    this.setConstraint(conditions, 'having');
                    let ratio = this.filterService.ratioSubject.getValue();
                    if (ratio !== 1) {
                        this.data.widget.query.params[0].sample = ratio;
                    }
                    return this.api.execute(this.data.widget.query);
                })
            )
            .subscribe(
                (response: Result) => {
                    this.chart = this.draw(response);
                },
                console.error);
    }

    private setConstraint(conditions, name) {
        if (conditions[name]) {
            this.data.widget.query.params[0][name] = conditions[name];
        } else {
            delete this.data.widget.query.params[0][name];
        }
    }
}

export interface Restore {
    title: string;
    filter: any[];
}