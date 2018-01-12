import { forwardRef, Inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

import { APIService } from './api.service';
import { MessageService } from './message.service';

import { BiRequestBuilder, Message, MessageType, Methods, Result, User } from 'app/model';

@Injectable()
export class AuthenticationService {
    private userSubject = new BehaviorSubject<User>(new User());
    public user$: Observable<User> = this.userSubject.asObservable();
    private isLogInSubject = new BehaviorSubject<boolean>(false);
    public isLogIn$: Observable<boolean> = this.isLogInSubject.asObservable();
    private accessLevelSubject = new BehaviorSubject<number>(-1);
    public accessLevel$: Observable<number> = this.accessLevelSubject.asObservable();

    constructor(private http: HttpClient,
                private api: APIService,
                @Inject(forwardRef(() => MessageService))
                private messagesService: MessageService) {
    }

    private _isLoginOpen = false;

    get isLoginOpen(): boolean {
        return this._isLoginOpen;
    }

    set isLoginOpen(value: boolean) {
        this._isLoginOpen = value;
    }

    private _isLogin = false;

    get isLogin(): boolean {
        return this._isLogin;
    }

    set isLogin(value: boolean) {
        this._isLogin = value;
    }

    checkConnection(): Observable<boolean> {
        if (!this.isLogInSubject.getValue()) {
            return this.userInfo();
        } else {
            return Observable.of(true);
        }
    }

    userInfo(): Observable<boolean> {
        return this.http.get('/main/desktop/user_settings/')
            .map((response: HttpResponse<User>) => {
                    if (response) {
                        const user = User.fromJSON(response);

                        this.userSubject.next(user);
                        this.isLogInSubject.next(true);

                        return true;
                    }
                    return false;
                }
            ).catch(() => {
                return Observable.of(false);
            });
    }

    initAccessLevel(id: string): void {
        this.api
            .execute(
                new BiRequestBuilder()
                    .method(Methods.GET_USER_ACCESS)
                    .params([{id: id}])
                    .build())
            .map(response => response.result)
            .subscribe(level => this.accessLevelSubject.next(level),
                () => this.accessLevelSubject.next(-1));
    }

    login(param: Object): Observable<boolean> {
        const query = {
            jsonrpc: '2.0',
            method: 'login',
            params: [param]
        };

        return this.http.post<Result>('/api/login/', JSON.stringify(query))
            .map(response => response.result)
            .catch(response => {
                this.messagesService.message(new Message(MessageType.DANGER, response.toString()));
                return Observable.throw(response.toString());
            });
    }

    logout(): void {
        this.isLogInSubject.next(false);
        this.isLoginOpen = true;
    }
}
