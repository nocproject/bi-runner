
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';




import { Message, MessageType } from '../model';
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
        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    if (event.url && event.url.indexOf('/api/bi/')) {
                        if (event.body.error) {
                            this.messagesService.message(new Message(MessageType.DANGER, event.body.error));
                            return observableThrowError(event.body.error);
                        }
                    }
                }
                return event;
            }),
            catchError(err => {
                if (err instanceof HttpErrorResponse) {
                    const error = err;
                    if (error.status !== 200) {
                        this.messagesService.message(new Message(MessageType.DANGER, `${error.message} : status ${error.status}`));
                    }
                }
                return observableThrowError(err);
            }),);
    }
}
