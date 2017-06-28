import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { Event } from '../models/event.interface';

@Injectable()
export class EventService {
    private eventSubject = new BehaviorSubject<Event>(null);
    event$: Observable<Event> = this.eventSubject.asObservable();

    next(event: Event): void {
        this.eventSubject.next(event);
    }
}
