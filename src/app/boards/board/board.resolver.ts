import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { Board, Methods, QueryBuilder } from '../../model';
import { APIService } from '../../services/api.service';

@Injectable()
export class BoardResolver implements Resolve<Board> {

    constructor(private api: APIService) {
    }

    resolve(route: ActivatedRouteSnapshot,
            state: RouterStateSnapshot): Board | Observable<Board> | Promise<Board> {

        return this.api.execute(
            new QueryBuilder()
                .method(Methods.GET_DASHBOARD)
                .params([route.params['id']])
                .build())
            .map(item => Board.fromJSON(item.result));
    }
}
