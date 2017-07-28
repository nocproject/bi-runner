import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

import { Message, MessageType, Methods, QueryBuilder, User } from '../../model';
import { APIService, MessageService } from '../../services';
import { Http } from '../../shared/interceptor/service/http.service';

@Injectable()
export class AuthenticationService {
    get isLoginOpen(): boolean {
        return this._isLoginOpen;
    }

    set isLoginOpen(value: boolean) {
        this._isLoginOpen = value;
    }

    get isLogin(): boolean {
        return this._isLogin;
    }

    set isLogin(value: boolean) {
        this._isLogin = value;
    }

    private _isLoginOpen = false;
    private _isLogin = false;

    private userSubject = new BehaviorSubject<User>(new User());
    public user$: Observable<User> = this.userSubject.asObservable();

    private isLogInSubject = new BehaviorSubject<boolean>(false);
    public isLogIn$: Observable<boolean> = this.isLogInSubject.asObservable();

    private accessLevelSubject = new BehaviorSubject<number>(-1);
    public accessLevel$: Observable<number> = this.accessLevelSubject.asObservable();

    constructor(private http: Http,
                private api: APIService,
                private messagesService: MessageService) {
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
            .map(
                (response: Response) => {
                    if (response) {
                        const user = User.fromJSON(response.json());
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
                new QueryBuilder()
                    .method(Methods.GET_USER_ACCESS)
                    .params([{id: id}])
                    .build())
            .map(response => response.result)
            .subscribe(level => this.accessLevelSubject.next(level),
                _ => this.accessLevelSubject.next(-1));
    }

    login(param: Object): Observable<boolean> {
        const query = {
            jsonrpc: '2.0',
            method: 'login',
            params: [param]
        };

        return this.http.post('/api/login/', JSON.stringify(query))
            .map(response => response.json().result)
            .do(result => console.log(result))
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
