import { Component, OnInit } from '@angular/core';
import { APIService } from '@app/services';
import { Observable } from 'rxjs/Rx';

@Component({
    selector: 'bi-spinner',
    template: `
        <div [ngClass]="{'spinner': (requestQty$ | async) !== 0}"></div>
    `
})
export class SpinnerComponent implements OnInit {
    requestQty$: Observable<number>;

    constructor(private api: APIService) {
    }

    ngOnInit(): void {
        this.requestQty$ = this.api.requestQty$;
    }
}
