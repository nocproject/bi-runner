import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';

import * as _ from 'lodash';

import { environment } from '@env/environment';

import { APIService, AuthenticationService, FilterService, LanguageService, MessageService } from '@app/services';
import { BoardResolver } from '../board/services';

import { Board, Message, MessageType, Methods, BiRequestBuilder, User } from '../model';
import { ModalComponent } from '../shared/modal/modal';
import { Export } from './export';

@Component({
    selector: 'bi-header',
    styleUrls: ['./header.component.scss'],
    templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit, OnDestroy {
    user$: Observable<User>;
    isLogin$: Observable<boolean>;
    board$: Observable<Board>;
    isReportOpen$: Observable<boolean>;
    accessLevel$: Observable<number>;
    exportSpin: boolean = false;
    version = environment.version;
    lang: string;
    // save as form
    saveForm: FormGroup;
    boardTitle: string;
    titleError: string;
    boardDesc: string;
    private boardSubscription: Subscription;
    private saveAsSubscription: Subscription;

    constructor(public languageService: LanguageService,
                private authService: AuthenticationService,
                private messages: MessageService,
                private api: APIService,
                private route: Router,
                private boardResolver: BoardResolver,
                private filterService: FilterService,
                private location: Location) {
    }

    ngOnInit() {
        this.user$ = this.authService.user$;
        this.isLogin$ = this.authService.isLogIn$;
        this.board$ = this.boardResolver.board$;
        this.isReportOpen$ = this.filterService.isReportOpen$;
        this.accessLevel$ = this.authService.accessLevel$;

        this.boardSubscription = this.board$
            .subscribe(board => {
                    if (board && board.id) {
                        setTimeout(() => this.boardTitle = board.title, 0);
                        setTimeout(() => this.boardDesc = board.description, 0);
                        this.authService.initAccessLevel(board.id);
                    }
                }
            );
        this.saveForm = new FormGroup({
            'title': new FormControl(null, [Validators.required]),
            'description': new FormControl(null, [Validators.required])
        });
        this.lang = this.languageService.current;
        this.saveAsSubscription = this.saveForm.get('title').valueChanges.subscribe(
            () => this.titleError = ''
        );
    }

    ngOnDestroy(): void {
        this.boardSubscription.unsubscribe();
        this.saveAsSubscription.unsubscribe();
    }

    onSaveBoard() {
        const board = _.clone(this.boardResolver.getBoard());

        board.groups = this.filterService.allFilters();
        board.sample = this.filterService.ratioSubject.getValue();
        const query = new BiRequestBuilder()
            .method(Methods.SET_DASHBOARD)
            .params([board.prepare()])
            .build();
        this.api.execute(query).first().subscribe(
            () => {
                this.messages.message(new Message(MessageType.INFO, 'MESSAGES.SAVED'));
            }
        );
    }

    onSaveAsBoard(modal: ModalComponent) {
        const board = _.clone(this.boardResolver.getBoard());

        board.title = this.saveForm.get('title').value;
        board.description = this.saveForm.get('description').value;
        board.groups = this.filterService.allFilters();
        board.sample = this.filterService.ratioSubject.getValue();
        delete board['id'];

        const query = new BiRequestBuilder()
            .method(Methods.SET_DASHBOARD)
            .params([board.prepare()])
            .build();
        this.api.execute(query).first()
            .subscribe(response => {
                this.filterService.cleanFilters();
                this.messages.message(new Message(MessageType.INFO, 'MESSAGES.SAVED'));
                modal.close();
                this.location.replaceState(`/board/${response.result}`);
                this.boardTitle = board.title;
                board.id = response.result;
                this.boardResolver.next(board);
            }, error => {
                let responseBody = error.json();
                if (responseBody.hasOwnProperty('error') && _.includes(responseBody.error, 'name exists')) {
                    this.titleError = 'VALIDATOR.NAME_EXIST';
                }
            });
    }

    onRemoveBoard(modal: ModalComponent) {
        const board = _.clone(this.boardResolver.getBoard());
        const query = new BiRequestBuilder()
            .method(Methods.REMOVE_DASHBOARD)
            .params([board.id])
            .build();
        modal.close();
        this.api.execute(query).first()
            .subscribe(() => {
                this.messages.message(new Message(MessageType.INFO, 'MESSAGES.REMOVED'));
                this.route.navigate([''])
                    .catch(err => console.log(err));
            });
    }

    onExport(): void {
        this.exportSpin = true;
        Export.query(this.api, this.boardResolver, this.filterService)
            .first()
            .subscribe(
                (response) => {
                    this.exportSpin = false;
                    Export.save(response.result, this.boardResolver);
                }
            );
    }

    onChangeLang(lang: string) {
        this.lang = lang;
        this.languageService.use(lang);
    }
}
