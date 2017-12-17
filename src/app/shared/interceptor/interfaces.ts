import { Request, RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

/**
 * Request intereceptor options
 * @interface RequestInterceptorOptions
 */
export interface RequestInterceptorOptions {
    url: string | Request;
    options?: RequestOptionsArgs;
}

/**
 * Response intereceptor options
 * @interface ResponseInterceptorOptions
 * @extends {RequestInterceptorOptions}
 */
export interface ResponseInterceptorOptions extends RequestInterceptorOptions {
    response: Response;
}

/**
 * Interceptor interface
 * @interface Interceptor
 */
export interface Interceptor {
    request?(options: RequestInterceptorOptions): Observable<RequestInterceptorOptions> | RequestInterceptorOptions;

    requestError?(options: RequestInterceptorOptions): Observable<RequestInterceptorOptions> | RequestInterceptorOptions;

    response?(options: ResponseInterceptorOptions): Observable<ResponseInterceptorOptions> | ResponseInterceptorOptions;

    responseError?(options: ResponseInterceptorOptions): Observable<ResponseInterceptorOptions> | ResponseInterceptorOptions;
}

/**
 * Interceptor map interface
 */
export const MAP = [
    {
        success: 'request',
        fail: 'requestError'
    },
    {
        success: 'response',
        fail: 'responseError'
    }
];

/**
 * Interceptor types enum
 * @enum {number}
 */
export enum InterceptorType {
    REQUEST,
    RESPONSE
}
