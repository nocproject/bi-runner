import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

import { Message, MessageType, User } from '../model';
import { MessageService } from '../services';
import { Http } from '../shared/interceptor/service/http.service';
import { APIService } from './api.service';
import { QueryBuilder } from '../model/query.builder';
import { Methods } from '../model/methods.enum';

@Injectable()
export class UserService {
    get isLoginOpen(): boolean {
        return this._isLoginOpen;
    }

    set isLoginOpen(value: boolean) {
        this._isLoginOpen = value;
    }

    private _isLoginOpen = false;

    private userSubject = new BehaviorSubject(new User());
    public user$: Observable<User> = this.userSubject.asObservable();

    private isLogInSubject = new BehaviorSubject(false);
    public isLogIn$: Observable<boolean> = this.isLogInSubject.asObservable();

    constructor(private http: Http,
                private api: APIService,
                private activatedRoute: ActivatedRoute,
                private messagesService: MessageService) {
    }

    userInfo(): void {
        this.http.get('/main/desktop/user_settings/')
            .subscribe(
                (response: Response) => {
                    if (!this.isLoginOpen) {
                        const user = User.fromJSON(response.json());
                        this.userSubject.next(user);
                        this.isLogInSubject.next(true);
                    }
                }
                // () => {
                //     // this.messagesService.message(new Message(MessageType.DANGER, response.toString()));
                //     // this.userSubject.next(new User('error'));
                // },
                // () => console.log('/main/desktop/user_settings/ - finished!')
            );
    }

    accessLevel(id: string): Observable<number> {
        return this.api
            .execute(
                new QueryBuilder()
                    .method(Methods.GET_USER_ACCESS)
                    .params([{id: id}])
                    .build())
            .map(response => response.result)
            .publishLast().refCount();
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
