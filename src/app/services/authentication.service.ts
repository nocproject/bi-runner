import { forwardRef, Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { APIService } from './api.service';
import { MessageService } from './message.service';

import { BiRequestBuilder, Message, MessageType, Methods, Result, User } from '../model';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private userSubject = new Subject<User>();
    public displayName$ = this.displayName();
    private isLogInSubject = new BehaviorSubject<boolean>(false);
    public isLogIn$: Observable<boolean> = this.isLogInSubject.asObservable();
    private accessLevelSubject = new BehaviorSubject<number>(-1);
    public accessLevel$: Observable<number> = this.accessLevelSubject.asObservable();

    constructor(private http: HttpClient,
                private api: APIService,
                @Inject(forwardRef(() => MessageService))
                private messagesService: MessageService) {
    }

    set isLogin(value: boolean) {
        this.isLogInSubject.next(value);
    }

    set user(value: User) {
        this.userSubject.next(value);
    }

    hasCookies(): Observable<boolean> {
        if (!this.isLogInSubject.getValue()) {
            return this.http.get<boolean>('/api/login/is_logged/');
        }
        return of(true);
    }

    displayName(): Observable<string> {
        return this.http.get<User>('/main/desktop/user_settings/')
            .pipe(
                map(user => {
                    let name = user.username;
                    console.log(user);
                    if (user.first_name && user.first_name.length > 0
                        && user.last_name && user.last_name.length > 0) {
                        name = `${user.first_name} ${user.last_name}`;
                    } else if (user.first_name && user.first_name.length > 0) {
                        name = user.first_name;
                    } else if (user.last_name && user.last_name.length > 0) {
                        name = user.last_name;
                    }

                    return name;
                })
            );
    }

    initAccessLevel(id: string): void {
        this.api
            .execute(
                new BiRequestBuilder()
                    .method(Methods.GET_USER_ACCESS)
                    .params([{id: id}])
                    .build()).pipe(
            map(response => response.result))
            .subscribe(level => this.accessLevelSubject.next(level),
                () => this.accessLevelSubject.next(-1));
    }

    login(param: Object): Observable<boolean> {
        const query = {
            jsonrpc: '2.0',
            method: 'login',
            params: [param]
        };

        return this.http.post<Result>('/api/login/', JSON.stringify(query)).pipe(
            map(response => response.result),
            tap(success => this.isLogInSubject.next(success)),
            catchError((response: HttpErrorResponse) => {
                this.messagesService.message(new Message(MessageType.DANGER, response.toString()));
                return throwError(response.toString());
            }));
    }

    logout(): void {
        this.isLogInSubject.next(false);
    }

    private static handleError(error: HttpErrorResponse) {
        console.log(error);
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError(
            'Something bad happened; please try again later.');
    };
}
