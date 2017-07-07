import { OnInit, Component, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'bi-access-level',
    template: `
        <span>access level : {{ text$ | async }}</span>
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
                    return 'read only';
                case 1:
                    return 'modify';
                case 2:
                    return 'admin';
                default:
                    return 'undefined';
            }
        });
    }
}
