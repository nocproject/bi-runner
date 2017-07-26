import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { Http } from '../shared/interceptor/service/http.service';
import { Query, Result } from '../model';

@Injectable()
export class APIService {
    private url = '/api/bi/';

    constructor(private http: Http) {
    }

    execute(query: Query): Observable<Result> {
        return this.http.post(this.url, query)
            .map(extractData);
    }

}

function extractData(response: Response): Result {
    return Result.fromJSON(response.json() || {});
}
