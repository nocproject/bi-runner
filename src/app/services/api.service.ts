import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

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
            .pipe(
                map(result => Result.fromJSON(result)),
                catchError((error: HttpErrorResponse) => {
                    if (error.error instanceof ErrorEvent) {
                        // A client-side or network error occurred. Handle it accordingly.
                        console.error('An error occurred:', error.error.message);
                    } else {
                        // The backend returned an unsuccessful response code.
                        console.error(`Backend returned code ${error.status}`);
                    }
                    console.error(query);
                    return throwError('Something bad happened; please try again later.');
                }),
                finalize(() => this.decreaseQty())
            );
    }

    private decreaseQty(): void {
        this.subject.next(this.subject.getValue() - 1);
    }
}
