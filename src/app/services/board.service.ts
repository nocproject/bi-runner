import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, publishLast, refCount, share, tap } from 'rxjs/operators';

import { deserialize } from 'typescript-json-serializer';

import { APIService } from './api.service';

import { BiRequestBuilder, Board, Methods } from '../model';

@Injectable({
    providedIn: 'root'
})
export class BoardService {
    private boardSubject = new BehaviorSubject<Board>(null);
    board$: Observable<Board> = this.boardSubject.asObservable();

    constructor(private api: APIService) {
    }

    getById(boardId: string): Observable<Board> {
        return  this.api.execute(
            new BiRequestBuilder()
                .method(Methods.GET_DASHBOARD)
                .params([boardId])
                .build())
            .pipe(
                map(response => deserialize<Board>(response.result, Board)),
                tap(board => this.boardSubject.next(board)),
                publishLast(),
                refCount()
            );
    }

    getBoard(): Board {
        return this.boardSubject.getValue();
    }

    next(board: Board): void {
        this.boardSubject.next(board);
    }

    // ToDo make save, remove methods
}
