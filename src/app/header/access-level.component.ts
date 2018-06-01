import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'bi-access-level',
    template: `
        <span> : {{ text$ | async | translate }}</span>
    `
})
export class AccessLevelComponent implements OnInit {
    @Input()
    level$: Observable<number>;
    text$: Observable<string>;

    ngOnInit(): void {
        this.text$ = this.level$.map(level => {
            switch (level) {
                case 0:
                    return 'ACCESS.READ';
                case 1:
                    return 'ACCESS.MODIFY';
                case 2:
                    return 'ACCESS.ADMIN';
                default:
                    return 'ACCESS.UNDEFINED';
            }
        });
    }
}
