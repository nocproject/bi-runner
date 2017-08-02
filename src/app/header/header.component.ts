import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';

import * as _ from 'lodash';

import { environment } from '../../environments/environment';

import { APIService, FilterService, MessageService } from '../services';
import { Board, Message, MessageType, Methods, QueryBuilder, User } from '../model';
import { ModalComponent } from '../shared/modal/modal';
import { Export } from './export';
import { AuthenticationService } from '../api/services/authentication.service';
import { LanguageService } from '../services/language.service';

@Component({
    selector: 'bi-header',
    templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit, OnDestroy {
    private boardSubscription: Subscription;
    user$: Observable<User>;
    isLogin$: Observable<boolean>;
    board$: Observable<Board>;
    isReportOpen$: Observable<boolean>;
    accessLevel$: Observable<number>;
    exportSpin: boolean = false;
    version = environment.version;
    lang;
    // save as form
    saveForm: FormGroup;
    boardTitle: string;
    boardDesc: string;

    constructor(private authService: AuthenticationService,
                private messages: MessageService,
                private api: APIService,
                private route: Router,
                private filterService: FilterService,
                private languageService: LanguageService) {
    }

    ngOnInit() {
        console.log('HeaderComponent ngOnInit');
        this.user$ = this.authService.user$;
        this.isLogin$ = this.authService.isLogIn$;
        this.board$ = this.filterService.board$;
        this.isReportOpen$ = this.filterService.isReportOpen$;
        this.accessLevel$ = this.authService.accessLevel$;

        this.boardSubscription = this.filterService.board$
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
    }

    ngOnDestroy(): void {
        this.boardSubscription.unsubscribe();
    }

    onSaveBoard() {
        const board = _.clone(this.filterService.boardSubject.getValue());
        board.groups = this.filterService.allFilters();
        board.format = 2;
        const query = new QueryBuilder()
            .method(Methods.SET_DASHBOARD)
            .params([board.prepare()])
            .build();
        this.api.execute(query).first().subscribe(
            () => {
                this.messages.message(new Message(MessageType.INFO, 'Saved'));
            }
        );
        // .toPromise()
        //     .then(() => {
        //         this.messages.message(new Message(MessageType.INFO, 'Saved'));
        //     });
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
        this.api.execute(query).first()
            .subscribe(response => {
                this.messages.message(new Message(MessageType.INFO, 'Saved'));
                // this.route.navigate(['']);
                // ToDo problem
                console.log(response.result);
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
        this.api.execute(query).first()
            .subscribe(() => {
                this.messages.message(new Message(MessageType.INFO, 'Removed'));
                this.route.navigate(['']);
            });
    }

    onExport(): void {
        this.exportSpin = true;
        Export.query(this.api, this.filterService)
            .first()
            .subscribe(
                (response) => {
                    this.exportSpin = false;
                    Export.save(response.result, this.filterService);
                    console.log('Exported');
                }
            );
    }

    onChangeLang(lang: string){
        this.lang = lang;
        this.languageService.use(lang);
    }
}
