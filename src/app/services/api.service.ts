import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { BiRequest, Result } from 'app/model';

@Injectable()
export class APIService {
    private url = '/api/bi/';
    private subject = new BehaviorSubject<number>(0);
    requestQty$: Observable<number> = this.subject.asObservable();

    constructor(private http: HttpClient) {
    }

    execute(query: BiRequest): Observable<Result> {
        this.subject.next(this.subject.getValue() + 1);
        return this.http.post<Result>(this.url, query)
            // .first()
            .map(result => Result.fromJSON(result))
            .finally(() => this.decreaseQty());
    }

    private decreaseQty(): void {
        this.subject.next(this.subject.getValue() - 1);
    }
}

// function extractData(response: Response): Result {
//     return Result.fromJSON(response.json() || {});
// }
