import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { merge, switchMap } from 'rxjs/operators';

import { Board } from '@app/model';
import { CounterService } from '../../services/counter.service';
import { FilterService } from '../../services/filter.service';
import { FieldsTableService } from '../../services/fields-table.service';

@Component({
    selector: 'bi-counter',
    template: `<span class="badge">{{ qty$ | async }}</span>`
})
export class CounterComponent implements OnInit {
    @Input()
    board: Board;

    qty$: Observable<number>;

    constructor(private counterService: CounterService,
                private fieldsTableService: FieldsTableService,
                private filterService: FilterService) {
    }

    ngOnInit() {
        this.qty$ = this.fieldsTableService.fields$
            .pipe(
                merge(this.filterService.filters$),
                switchMap(() => this.counterService.qty(this.board))
            );
    }
}
