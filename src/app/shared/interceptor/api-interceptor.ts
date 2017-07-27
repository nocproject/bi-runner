import { Injectable, Optional } from '@angular/core';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Rx';

import { Interceptor, ResponseInterceptorOptions } from './interfaces';
import { DebugService, MessageService } from '../../services';
import { Message, MessageType } from '../../model';

@Injectable()
export class ApiInterceptor implements Interceptor {
    constructor(@Optional() private debug: DebugService,
                private messagesService: MessageService) {
    }

    public response({url, options, response}: ResponseInterceptorOptions): ResponseInterceptorOptions
        | Observable<ResponseInterceptorOptions> {

        if (_.includes(response.url, '/api/bi/') && response.json().error) {
            console.log('api interceptor : ', response.json().error);
            this.messagesService.message(new Message(MessageType.DANGER, response.json().error));
            return Observable.throw({url, options, response});
        }
        // ToDo make DI only in development mode (environment.production !== true)
        // if (!environment.production && _.includes(response.url, '/api/bi/') && response.json().result.sql) {
        if (_.includes(response.url, '/api/bi/') && response.json().result.sql) {
            this.debug.debug(response.json().result.sql);
        }
        return Observable.of({url, options, response});
    }
}
