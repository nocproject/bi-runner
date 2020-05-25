import { Injectable } from '@angular/core';

import { Observable ,  BehaviorSubject } from 'rxjs';

@Injectable()
export class LayoutService {
    isReportOpenSubject = new BehaviorSubject<boolean>(false);
    isReportOpen$: Observable<boolean> = this.isReportOpenSubject.asObservable();
}
