import { Injectable, Optional } from '@angular/core';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Rx';

import { environment } from '../../../environments/environment';
import { Interceptor, ResponseInterceptorOptions } from './interfaces';
import { DebugService, MessageService } from '../../services';
import { Message, MessageType } from '../../model';

@Injectable()
export class ApiInterceptor implements Interceptor {
    constructor(private messagesService: MessageService,
                @Optional() private debug: DebugService) {
    }

    public response({url, options, response}: ResponseInterceptorOptions): ResponseInterceptorOptions
        | Observable<ResponseInterceptorOptions> {

        if (_.includes(response.url, '/api/bi/') && response.json().error) {
            console.log('api interceptor : ', response.json().error);
            this.messagesService.message(new Message(MessageType.DANGER, response.json().error));
            return Observable.throw({url, options, response});
        }
        if (!environment.production && _.includes(response.url, '/api/bi/') && response.json().result.sql) {
            this.debug.debug(response.json().result.sql);
        }
        return Observable.of({url, options, response});
    }

    public responseError({url, options, response}: ResponseInterceptorOptions): ResponseInterceptorOptions
        | Observable<ResponseInterceptorOptions> {

        if (_.includes(response.url, '/api/bi/')) {
            this.messagesService.message(new Message(MessageType.DANGER, response.statusText));
        }
        return Observable.of({url, options, response});
    }
}
