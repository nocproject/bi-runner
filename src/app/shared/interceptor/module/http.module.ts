import { NgModule } from '@angular/core';
import { HttpModule as _HttpModule, RequestOptions, XHRBackend } from '@angular/http';

import { Http, InterceptorStore } from '../service';
import { httpFactory } from './http.factory';
import { AuthInterceptor } from '../auth-interceptor';
import { ApiInterceptor } from '../api-interceptor';

@NgModule({
    imports: [_HttpModule],
    providers: [
        InterceptorStore,
        {
            provide: Http,
            deps: [
                XHRBackend,
                RequestOptions,
                InterceptorStore
            ],
            useFactory: httpFactory
        },
        AuthInterceptor,
        ApiInterceptor
    ]
})
export class HttpModule {
    constructor(interceptorStore: InterceptorStore,
                authInterceptor: AuthInterceptor,
                apiInterceptor: ApiInterceptor) {
        interceptorStore.register(authInterceptor);
        interceptorStore.register(apiInterceptor);
    }
}
