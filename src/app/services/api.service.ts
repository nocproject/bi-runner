import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';

import { BiRequest, Result } from '../model';

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
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.error instanceof ErrorEvent) {
                        // A client-side or network error occurred. Handle it accordingly.
                        console.error('An error occurred:', error.error.message);
                    } else {
                        // The backend returned an unsuccessful response code.
                        console.error(`Backend returned code ${error.status}`);
                    }
                    // return an ErrorObservable with a user-facing error message
                    return new ErrorObservable('Something bad happened; please try again later.');
                })
            )
            .finally(() => this.decreaseQty());
    }

    private decreaseQty(): void {
        this.subject.next(this.subject.getValue() - 1);
    }
}
