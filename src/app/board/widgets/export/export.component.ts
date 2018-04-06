import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { map, merge, switchMap } from 'rxjs/operators';

import { Board, Field } from '@app/model';
import { FieldsTableService } from '../../services/fields-table.service';
import { FilterService } from '../../services/filter.service';
import { CounterService } from '../../services/counter.service';

@Component({
    selector: 'bi-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
    @Input()
    board: Board;
    columns$: Observable<any[]>;
    rows$: Observable<any[]>;
    loadingIndicator: boolean = false;

    constructor(private counterService: CounterService,
                private fieldsTableService: FieldsTableService,
                private filterService: FilterService) {
    }

    ngOnInit() {
        this.columns$ = this.fieldsTableService.fields$.pipe(
            map((fields: Field[]) =>
                fields.filter(field => !('hide' in field) || !field.hide)
                    .map(field => {
                        return {
                            name: field.label,
                            prop: field.alias ? field.alias : field.expr
                        };
                    })
            )
        );
        this.rows$ = this.fieldsTableService.fields$.pipe(
            merge(this.filterService.filters$),
            switchMap(() => this.counterService.sampleExport(this.board))
        );
    }
}
