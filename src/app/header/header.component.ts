import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';

import * as _ from 'lodash';

import { environment } from '../../environments/environment';

import { APIService, FilterService, MessageService, UserService } from '../services';
import { Board, QueryBuilder, Message, Methods, MessageType, User } from '../model';
import { ModalComponent } from '../shared/modal/modal';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bi-header',
    templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit, OnDestroy {
    user$: Observable<User>;
    isLogin$: Observable<boolean>;
    board$: Observable<Board>;
    isReportOpen$: Observable<boolean>;
    accessLevel$: Observable<number>;
    saveSubscription: Subscription;
    saveAsSubscription: Subscription;
    removeSubscription: Subscription;
    isExecExport = false;
    version = environment.version;

    // save as form
    saveForm: FormGroup;
    boardTitle: string;
    boardDesc: string;

    constructor(private userService: UserService,
                private messages: MessageService,
                private api: APIService,
                private route: Router,
                private filterService: FilterService) {
    }

    ngOnInit() {
        console.log('HeaderComponent ngOnInit');
        this.user$ = this.userService.user$;
        this.isLogin$ = this.userService.isLogIn$;
        this.board$ = this.filterService.board$;
        this.isReportOpen$ = this.filterService.isReportOpen$;
        this.userService.userInfo();
        this.accessLevel$ = this.filterService.board$
            .switchMap(board => {
                    if (board && board.id) {
                        this.boardTitle = board.title;
                        this.boardDesc = board.description;
                        return this.userService.accessLevel(board.id);
                    }
                    return Observable.of(-1);
                }
            );
        this.saveForm = new FormGroup({
            'title': new FormControl(null, [Validators.required]),
            'description': new FormControl(null, [Validators.required])
        });
    }

    ngOnDestroy(): void {
        this.saveSubscription.unsubscribe();
        this.saveAsSubscription.unsubscribe();
        this.removeSubscription.unsubscribe();
    }

    onSaveBoard() {
        const board = _.clone(this.filterService.boardSubject.getValue());
        board.groups = this.filterService.allFilters();
        board.format = 2;
        const query = new QueryBuilder()
            .method(Methods.SET_DASHBOARD)
            .params([board.prepare()])
            .build();
        console.log(this.filterService.allFilters());
        console.log(query);
        this.saveSubscription = this.api.execute(query)
            .subscribe(() => {
                this.messages.message(new Message(MessageType.INFO, 'Saved'));
            });
    }

    onSaveAsBoard(modal: ModalComponent) {
        const board = _.clone(this.filterService.boardSubject.getValue());
        board.title = this.saveForm.get('title').value;
        board.description = this.saveForm.get('description').value;
        delete board['id'];

        const query = new QueryBuilder()
            .method(Methods.SET_DASHBOARD)
            .params([board.prepare()])
            .build();
        modal.close();
        this.saveAsSubscription = this.api.execute(query)
            .subscribe(response => {
                this.messages.message(new Message(MessageType.INFO, 'Saved'));
                this.route.navigate(['board', response.result]);
            });
    }

    onRemoveBoard(modal: ModalComponent) {
        const board = _.clone(this.filterService.boardSubject.getValue());
        const query = new QueryBuilder()
            .method(Methods.REMOVE_DASHBOARD)
            .params([board.id])
            .build();
        modal.close();
        this.removeSubscription = this.api.execute(query)
            .subscribe(() => {
                this.messages.message(new Message(MessageType.INFO, 'Removed'));
                this.route.navigate(['']);
            });
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
