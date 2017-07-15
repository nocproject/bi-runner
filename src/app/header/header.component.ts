import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';

import * as _ from 'lodash';

import { environment } from '../../environments/environment';

import { APIService, FilterService, MessageService, UserService } from '../services';
import { Board, QueryBuilder, Message, Methods, MessageType, User } from '../model';
import { ModalComponent } from '../shared/modal/modal';
import { Export } from './export';

@Component({
    selector: 'bi-header',
    templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {
    user$: Observable<User>;
    isLogin$: Observable<boolean>;
    board$: Observable<Board>;
    isReportOpen$: Observable<boolean>;
    accessLevel$: Observable<number>;
    exportSpin: boolean = false;
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
                        setTimeout(() => this.boardTitle = board.title, 0);
                        setTimeout(()=> this.boardDesc = board.description, 0);
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

    onSaveBoard() {
        const board = _.clone(this.filterService.boardSubject.getValue());
        board.groups = this.filterService.allFilters();
        board.format = 2;
        const query = new QueryBuilder()
            .method(Methods.SET_DASHBOARD)
            .params([board.prepare()])
            .build();
        this.api.execute(query).toPromise()
            .then(() => {
                this.messages.message(new Message(MessageType.INFO, 'Saved'));
            });
    }

    onSaveAsBoard(modal: ModalComponent) {
        const board = _.clone(this.filterService.boardSubject.getValue());
        board.title = this.saveForm.get('title').value;
        board.description = this.saveForm.get('description').value;
        board.groups = this.filterService.allFilters();
        delete board['id'];
        this.filterService.cleanFilters();

        const query = new QueryBuilder()
            .method(Methods.SET_DASHBOARD)
            .params([board.prepare()])
            .build();
        modal.close();
        this.api.execute(query).toPromise()
            .then(response => {
                this.messages.message(new Message(MessageType.INFO, 'Saved'));
                this.route.navigate(['']);
                // console.log(response.result);
                // this.route.navigate(['board', response.result]);
            });
    }

    onRemoveBoard(modal: ModalComponent) {
        const board = _.clone(this.filterService.boardSubject.getValue());
        const query = new QueryBuilder()
            .method(Methods.REMOVE_DASHBOARD)
            .params([board.id])
            .build();
        modal.close();
        this.api.execute(query).toPromise()
            .then(() => {
                this.messages.message(new Message(MessageType.INFO, 'Removed'));
                this.route.navigate(['']);
            });
    }

    onExport(): void {
        // this.exportSpin = !this.exportSpin;
        this.exportSpin = true;
        setTimeout(() => {
            this.exportSpin = false;
            console.log('done');
        }, 2000);
        // Export.query(this.api, this.filterService)
        //     .toPromise()
        //     .then(
        //         () => {
        //             // console.log(this);
        //             // console.log(`onExport : ${this.exportSpin}`);
        //             // this.messages.message(new Message(MessageType.INFO, 'Exported'));
        //             this.exportSpin = 'no';
        //             // console.log(`onExport : ${this.exportSpin}`);
        //             console.log('Exported');
        //         }
        //     ).catch(msg => this.messages.message(new Message(MessageType.DANGER, msg)));

        // this.exportSpin = false;
        // ToDo make query from allGroups and allFilters, see CounterComponent.makeUniqQuery
        // this.api.execute(this.filterService.boardSubject.getValue().exportQry).subscribe();
        // console.log(this.filterService.allGroups());
        // console.log(this.filterService.allFilters());
    }
}
