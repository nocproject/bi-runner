import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { MessageService } from './message.service';
import { Http } from '../shared/interceptor/service/http.service';
import { Message, MessageType, Result } from '../model';
import { Query } from '../model/query';

@Injectable()
export class APIService {
    private url = '/api/bi/';

    constructor(private http: Http,
                private messagesService: MessageService) {
    }

    execute(query: Query): Observable<Result> {
        return this.http.post(this.url, query)
            .map(this.extractData)
            .catch(response => {
                console.log(response);
                this.messagesService.message(new Message(MessageType.DANGER, response.toString()));
                return Observable.throw(response.toString());
            });
    }

    private extractData(response: Response): Result {
        return Result.fromJSON(response.json() || {});
    }
}
