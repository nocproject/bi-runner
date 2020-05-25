import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { head } from 'lodash';
import * as moment from 'moment';

import { Observable ,  Subscription } from 'rxjs';
import { filter, flatMap, map } from 'rxjs/operators';

import { APIService, DatasourceService, LanguageService } from '@app/services';
import {
    BiRequestBuilder,
    Board,
    FilterBuilder,
    Group,
    GroupBuilder,
    IOption,
    Methods,
    Range,
    Value
} from '@app/model';

import { ReportRangeComponent } from '../report-range/report-range.component';
import { ModalComponent } from '../../shared/modal/modal';
//
import { EventType } from '../filters-form/model/event.interface';
import { EventService } from '../services/event.service';
import { FilterService } from '../services/filter.service';

@Component({
    // changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bi-selector',
    templateUrl: './selector.component.html'
})
export class SelectorComponent implements AfterViewInit, OnInit, OnDestroy {
    @Input()
    board: Board;
    @ViewChild(ReportRangeComponent)
    rangeForm: ReportRangeComponent;
    START_DATE = 'startDate';
    END_DATE = 'endDate';
    locale = 'en';
    values;
    reportRangeText: string = '-';
    lastUpdate$: Observable<any>;
    isSample$: Observable<boolean>;
    reportRangeFields$: Observable<IOption[]>;
    ratioForm: FormGroup;
    ratio: FormControl;
    collapsed = true;
    isNotInRange = true;
    // private rangeSubscription: Subscription;
    private eventSubscription: Subscription;
    private ratioSubscription: Subscription;

    constructor(private fb: FormBuilder,
                private api: APIService,
                private datasourceService: DatasourceService,
                private eventService: EventService,
                private filterService: FilterService,
                private languageService: LanguageService) {
        this.ratio = new FormControl(this.filterService.ratioSubject.getValue());
    }

    private static rangeText(from: any, to: any): string {
        if (Range.isNotRange(from)) {
            return `${moment(from).format('DD.MM.YYYY HH:mm')} - ${moment(to).format('DD.MM.YYYY HH:mm')}`;
        }
        return from;
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.ratio.setValue(this.filterService.ratioSubject.getValue());
            this.filterChangeSub();
        });
    }

    ngOnDestroy(): void {
        // this.rangeSubscription.unsubscribe();
        this.eventSubscription.unsubscribe();
        this.ratioSubscription.unsubscribe();
    }

    ngOnInit() {
        this.isNotInRange = this.board.groups && !this.board.groups[0].range;
        this.lastUpdate$ = this.api.execute(
            new BiRequestBuilder()
                .method(Methods.QUERY)
                .params([{
                    fields: [
                        {
                            expr: 'max(date)',
                            alias: 'date'
                        }
                    ],
                    datasource: this.board.datasource
                }])
                .build())
            .pipe(flatMap(response => head(response.data['result'])));

        this.ratioForm = this.fb.group({
            ratio: this.filterService.ratioSubject.getValue()
        });
        this.ratioSubscription = this.ratioForm.valueChanges.subscribe(data => {
            this.filterService.ratioSubject.next(+data.ratio);
            this.filterService.initFilters(this.filterService.allFilters());
        });
        this.isSample$ = this.datasourceService.isSample();
        this.reportRangeFields$ = this.datasourceService.fields()
            .pipe(
                map(array => array
                    .filter(field => !field.pseudo && field.type === 'DateTime' && field.isSelectable)
                    .map(field => {
                            return {
                                value: `${field.name}`,
                                text: field.description
                            };
                        }
                    )
                )
            );
    }

    onChangeRatio(value) {
        this.ratioForm.setValue({ratio: value});
    }

    openRangeDlg(modal: ModalComponent) {
        const rangeGroup = head(this.filterService.getFilter('startEnd'));

        this.locale = this.languageService.current;
        this.values = {
            [this.START_DATE]: rangeGroup.filters[0].values[0].value,
            [this.END_DATE]: rangeGroup.filters[0].values[1] ? rangeGroup.filters[0].values[1].value : null,
            fieldName: rangeGroup.filters[0].name,
            text: this.reportRangeText
        };
        modal.open();
    }

    applyRange(modal: ModalComponent) {
        const from = this.rangeForm.values[this.START_DATE];
        const to = this.rangeForm.values[this.END_DATE];
        const field = this.rangeForm.values['fieldName'];
        let range;
        if (this.rangeForm.range) {
            range = [new Value(this.rangeForm.range)];
            this.reportRangeText = `DATETIME_RANGE.${Range.getDates(this.rangeForm.range, false).text}`;
        } else {
            range = [new Value(from), new Value(to)];
            this.reportRangeText = SelectorComponent.rangeText(from, to);
        }
        this.filterService.filtersNext(
            new GroupBuilder()
                .name('startEnd')
                .filters([
                    new FilterBuilder()
                        .name(field)
                        .type('DateTime')
                        .condition('interval')
                        .values(range)
                        .build()
                ])
                .build()
        );
        modal.close();
    }

    private filterChangeSub() {
        this.eventSubscription = this.eventService.event$.pipe(
            filter(event => event !== null),
            filter(event => event.type === EventType.Restore),
            flatMap(event => event.payload),
            filter((group: Group) => group.name === 'startEnd')
        ).subscribe(
            (group: Group) => {
                let from = null;
                let to = null;
                if (Range.isNotRange(group.filters[0].values[0].value)) {
                    from = new Date(group.filters[0].values[0].value);
                    to = new Date(group.filters[0].values[1].value);
                    this.reportRangeText = SelectorComponent.rangeText(from, to);
                } else {
                    from = group.filters[0].values[0].value;
                    this.reportRangeText = `DATETIME_RANGE.${Range.getDates(from, false).text}`;
                }
                this.values = {
                    [this.START_DATE]: from,
                    [this.END_DATE]: to,
                    fieldName: group.filters[0].name
                };
            }
        );
    }
}
