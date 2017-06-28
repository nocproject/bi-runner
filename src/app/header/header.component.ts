import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { FilterService, UserService } from '../services';
import { Board, User } from '../model';

import { environment } from '../../environments/environment';

@Component({
    selector: 'bi-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.sass']
})

export class HeaderComponent implements OnInit {
    user$: Observable<User>;
    isLogin$: Observable<boolean>;
    board$: Observable<Board>;
    isReportOpen$: Observable<boolean>;

    isExecExport = false;
    version = environment.version;

    constructor(private userService: UserService,
                private filterService: FilterService,
                private router: Router) {
        console.log('HeaderComponent constructor');
    }

    ngOnInit() {
        console.log('HeaderComponent ngOnInit');
        this.user$ = this.userService.user$;
        this.isLogin$ = this.userService.isLogIn$;
        this.board$ = this.filterService.board$;
        this.isReportOpen$ = this.filterService.isReportOpen$;
        this.userService.userInfo();
    }

    onExport(): void {
        this.isExecExport = !this.isExecExport;
        // this.isExecExport = true;
        console.log(`onExport : ${this.isExecExport}`);
        // this.isExecExport = false;
        // ToDo make query from allGroups and allFilters, see CounterComponent.makeUniqQuery
        // this.api.execute(this.filterService.boardSubject.getValue().exportQry).subscribe();
        // console.log(this.filterService.allGroups());
        // console.log(this.filterService.allFilters());
    }
}
