import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

import { Event } from '../model';

@Injectable()
export class EventService {
    private eventSubject = new BehaviorSubject<Event>(null);
    event$: Observable<Event> = this.eventSubject.asObservable();

    next(event: Event): void {
        this.eventSubject.next(event);
    }
}
