import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class DebugService {
    private debugSubject = new BehaviorSubject<string>('');
    debug$: Observable<string> = this.debugSubject.asObservable();

    public debug(msg: string): void {
        this.debugSubject.next(msg);
    }
}
