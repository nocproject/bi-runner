import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Response } from '@angular/http';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Rx';

import { Interceptor, ResponseInterceptorOptions } from './interfaces';

@Injectable()
export class AuthInterceptor implements Interceptor {

    constructor(private router: Router) {
    }

    public response({url, options, response}: ResponseInterceptorOptions): ResponseInterceptorOptions
        | Observable<ResponseInterceptorOptions> {

        this.redirect(response);

        return Observable.of({url, options, response});
    }

    // public request({url, options}: RequestInterceptorOptions): RequestInterceptorOptions
    //     | Observable<RequestInterceptorOptions> {
    //
    //     return Observable.of({url, options});
    // }

    public responseError({url, options, response}: ResponseInterceptorOptions): ResponseInterceptorOptions
        | Observable<ResponseInterceptorOptions> {

        this.redirect(response);

        return Observable.throw({url, options, response});
    }

    // public requestError(options: RequestInterceptorOptions): RequestInterceptorOptions
    //     | Observable<RequestInterceptorOptions> {
    //
    //     return Observable.throw(options);
    // }

    private redirect(response: Response): void {
        if (!response.url || _.includes(response.url, '/api/login/index.html?uri=')) {
            console.log('not login, must redirect!');
            // this.messagesService.message(new Message(MessageType.DANGER, 'not login, must redirect!'));
            this.router.navigate(['login']);
        }
    }
}
