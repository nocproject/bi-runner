import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { Board, Field, Group } from '@app/model';
import { CounterService } from '../../services/counter.service';
import { FilterService } from '../../services/filter.service';

@Component({
    selector: 'bi-counter',
    template: `<span class="badge">{{ qty$ | async }}</span>`
})
export class CounterComponent implements OnInit {
    @Input()
    board: Board;

    qty$: Observable<number>;

    constructor(private counterService: CounterService,
                private filterService: FilterService) {
    }

    ngOnInit() {
        this.qty$ = this.filterService.groups$
            .merge(this.filterService.filters$)
            .switchMap((instance: Group[] | Field[]) => this.counterService.qty(instance, this.board));
    }
}
