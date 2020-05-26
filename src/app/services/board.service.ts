import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable ,  BehaviorSubject } from 'rxjs';
import { map, publishLast, refCount, share, tap } from 'rxjs/operators';

import { APIService } from './api.service';

import { BiRequestBuilder, Board, Methods } from '@app/model';

@Injectable()
export class BoardService implements Resolve<Board> {
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
            .pipe(
                map(response => response.result),
                publishLast(),
                refCount()
            );

        this.board$ = board$.pipe(share());
        return board$;
    }

    getBoard(): Board {
        return this.boardSubject.getValue();
    }

    next(board: Board): void {
        this.boardSubject.next(board);
    }
}
