import { Injectable } from '@angular/core';
import {
    HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,
    HttpResponse
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { Message, MessageType } from 'app/model';
import { MessageService } from './message.service';

@Injectable()
export class APIInterceptor implements HttpInterceptor {
    constructor(private messagesService: MessageService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // return next.handle(req);
        // request = request.clone({
        //   setHeaders: {
        //     Authorization: `Basic ${btoa('<username>:<password>')}`
        //   }
        // });
        return next.handle(request)
            .map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    if (event.url.indexOf('/api/bi/')) {
                        if (event.body.error) {
                            throw({id: 1, message: event.body.error});
                        }
                    }
                }
                return event;
            })
            .catch(err => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status === 401) {
                        return Observable.throw(err);
                    }
                }

                if (err.hasOwnProperty('id') && err['id'] === 1) { // API BI error
                    this.messagesService.message(new Message(MessageType.DANGER, err.message));
                    return Observable.throw(`response with error : '${err.message}'`);
                }

                return Observable.throw(err);
            });
    }
}
