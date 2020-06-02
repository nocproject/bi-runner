import { AfterViewInit, Component } from '@angular/core';
import { APIService } from '@app/services';

import { Observable } from 'rxjs';

@Component({
    selector: 'bi-spinner',
    template: `
        <div [ngClass]="{'spinner': (requestQty$ | async) !== 0}"></div>
    `
})
export class SpinnerComponent implements AfterViewInit {
    requestQty$: Observable<number>;

    constructor(private api: APIService) {
    }

    ngAfterViewInit(): void {
        this.requestQty$ = this.api.requestQty$;
    }
}
