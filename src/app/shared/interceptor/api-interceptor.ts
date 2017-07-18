import { Injectable, Optional } from '@angular/core';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Rx';

import { Interceptor, ResponseInterceptorOptions } from './interfaces';
import { DebugService } from '../../services/debug.service';

@Injectable()
export class ApiInterceptor implements Interceptor {
    constructor(@Optional() private debug: DebugService) {
    }

    public response({url, options, response}: ResponseInterceptorOptions): ResponseInterceptorOptions
        | Observable<ResponseInterceptorOptions> {

        if (_.includes(response.url, '/api/bi/') && response.json().error) {
            console.log('api interceptor : ', response.json());
            return Observable.throw(response.json().error);
        }
        // ToDo make DI only in development mode (environment.production !== true)
        // if (!environment.production && _.includes(response.url, '/api/bi/') && response.json().result.sql) {
        if (_.includes(response.url, '/api/bi/') && response.json().result.sql) {
            this.debug.debug(response.json().result.sql);
        }
        return Observable.of({url, options, response});
    }
}
