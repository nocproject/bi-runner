import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs';

import { Board } from '@app/model';
import { BoardService } from './board.service';

@Injectable({
    providedIn: 'root'
})
export class BoardResolver implements Resolve<Board> {
    constructor(private boardService: BoardService) {
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Board | Observable<Board> | Promise<Board> {
        return this.boardService.getById(route.paramMap.get('boardId'));
    }
}
