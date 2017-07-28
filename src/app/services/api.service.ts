import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Http } from '../shared/interceptor/service/http.service';
import { Query, Result } from '../model';

@Injectable()
export class APIService {
    private url = '/api/bi/';
    private subject = new BehaviorSubject<number>(0);
    requestQty$: Observable<number> = this.subject.asObservable();

    constructor(private http: Http) {
    }

    execute(query: Query): Observable<Result> {
        this.subject.next(this.subject.getValue() + 1);
        return this.http.post(this.url, query)
            .first()
            .map(extractData)
            .finally(() => this.decreaseQty());
    }

    private decreaseQty(): void {
        this.subject.next(this.subject.getValue() - 1);
    }
}

function extractData(response: Response): Result {
    return Result.fromJSON(response.json() || {});
}
