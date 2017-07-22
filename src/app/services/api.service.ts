import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';

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
            .map(extractData)
            .catch(response => {
                console.log(response);
                this.messagesService.message(new Message(MessageType.DANGER, response.json().error));
                return Observable.throw(response);
            });
    }

}

function extractData(response: Response): Result {
    return Result.fromJSON(response.json() || {});
}
