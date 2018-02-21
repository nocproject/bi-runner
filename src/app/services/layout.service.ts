import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class LayoutService {
    isReportOpenSubject = new BehaviorSubject<boolean>(false);
    isReportOpen$: Observable<boolean> = this.isReportOpenSubject.asObservable();
}
