import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { APIService } from '../../services';

import { BiRequestBuilder, Board, Methods } from '../../model';

@Injectable()
export class BoardResolver implements Resolve<Board> {
    private boardSubject = new BehaviorSubject<Board>(null);
    board$: Observable<Board> = this.boardSubject.asObservable();

    constructor(private api: APIService) {
    }

    resolve(route: ActivatedRouteSnapshot,
            state: RouterStateSnapshot): Board | Observable<Board> | Promise<Board> {
        const board$ = this.api.execute(
            new BiRequestBuilder()
                .method(Methods.GET_DASHBOARD)
                .params([route.params['id']])
                .build())
            .map(response => Board.fromJSON(response.result))
            .publishLast()
            .refCount();

        this.board$ = board$.share();
        return board$;
    }

    getBoard(): Board {
        return this.boardSubject.getValue();
    }

    next(board: Board): void {
        this.boardSubject.next(board);
    }
}
