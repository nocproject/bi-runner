import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Observable, Subscription } from 'rxjs';
import { finalize, first, map } from 'rxjs/operators';

import { cloneDeep, includes } from 'lodash';
import { serialize } from 'typescript-json-serializer';

import { environment } from '@env/environment';

import {
    APIService,
    AuthenticationService,
    BoardService,
    DatasourceService,
    LanguageService,
    LayoutService,
    MessageService
} from '@app/services';
import { FilterService } from '@board/services';

import { BiRequestBuilder, Board, Field, IOption, Message, MessageType, Methods } from '../model';
import { ModalComponent } from '../shared/modal/modal';
import { Export } from './export';

@Component({
    selector: 'bi-header',
    styleUrls: ['./header.component.scss'],
    templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit, OnDestroy {
    displayName$: Observable<string>;
    isLogin$: Observable<boolean>;
    board$: Observable<Board>;
    isReportOpen$: Observable<boolean>;
    accessLevel$: Observable<number>;
    newFields$: Observable<IOption[]>;
    exportSpin: boolean = false;
    version = environment.version;
    lang: string;
    // save as form
    saveForm: FormGroup;
    titleError: string;
    // add field form
    addFieldForm: FormGroup;
    fieldName: string;
    private boardSubscription: Subscription;
    private saveAsSubscription: Subscription;
    private addFieldSubscription: Subscription;

    constructor(public languageService: LanguageService,
                private authService: AuthenticationService,
                private messages: MessageService,
                private api: APIService,
                private route: Router,
                private layoutService: LayoutService,
                private boardService: BoardService,
                private filterService: FilterService,
                private datasource: DatasourceService,
                private location: Location) {
    }

    ngOnInit() {
        this.displayName$ = this.authService.displayName$;
        this.isLogin$ = this.authService.isLogIn$;
        this.board$ = this.boardService.board$;
        this.isReportOpen$ = this.layoutService.isReportOpen$;
        this.accessLevel$ = this.authService.accessLevel$;

        this.boardSubscription = this.board$
            .subscribe(board => {
                    if (board?.id) {
                        this.saveForm.patchValue({title: board.title, description: board.description});
                        this.authService.initAccessLevel(board.id);
                        this.newFields$ = this.datasource.newFieldsAsOption();
                    }
                }
            );
        this.saveForm = new FormGroup({
            'title': new FormControl(null, [Validators.required]),
            'description': new FormControl(null, [Validators.required])
        });
        this.addFieldForm = new FormGroup({
            'name': new FormControl(null, [Validators.required]),
            'group': new FormControl(null, [Validators.required]),
            'fields': new FormControl(true),
            'filters': new FormControl(true)

        });
        this.lang = this.languageService.current;
        this.saveAsSubscription = this.saveForm.get('title').valueChanges.subscribe(
            () => this.titleError = ''
        );
    }

    // ToDo Make custom decorator
    ngOnDestroy(): void {
        if (this.boardSubscription) {
            this.boardSubscription.unsubscribe();
        }
        if (this.saveAsSubscription) {
            this.saveAsSubscription.unsubscribe();
        }
        if (this.addFieldSubscription) {
            this.addFieldSubscription.unsubscribe();
        }
    }

    onSaveBoard() {
        const board = cloneDeep(this.boardService.getBoard());

        board.groups = this.filterService.allFilters();
        board.sample = this.filterService.ratioSubject.getValue();
        const query = new BiRequestBuilder()
            .method(Methods.SET_DASHBOARD)
            .params([board.prepare()])
            .build();
        this.api.execute(query).pipe(first()).subscribe(
            () => {
                this.messages.message(new Message(MessageType.INFO, 'MESSAGES.SAVED'));
            }
        );
    }

    onSaveAsBoard(modal: ModalComponent) {
        const board = cloneDeep(this.boardService.getBoard());

        board.title = this.saveForm.get('title').value;
        board.description = this.saveForm.get('description').value;
        board.groups = this.filterService.allFilters();
        board.sample = this.filterService.ratioSubject.getValue();
        delete board['id'];

        const query = new BiRequestBuilder()
            .method(Methods.SET_DASHBOARD)
            .params([board.prepare()])
            .build();
        this.api.execute(query)
            .pipe(first())
            .subscribe(response => {
                this.messages.message(new Message(MessageType.INFO, 'MESSAGES.SAVED'));
                modal.close();
                this.location.replaceState(`/board/${response.result}`);
                this.saveForm.patchValue({title: board.title, description: board.description});
                board.id = response.result;
                this.boardService.next(board);
            }, error => {
                let responseBody = error.json();
                if (responseBody.hasOwnProperty('error') && includes(responseBody.error, 'name exists')) {
                    this.titleError = 'VALIDATOR.NAME_EXIST';
                }
            });
    }

    onRemoveBoard(modal: ModalComponent) {
        const board = cloneDeep(this.boardService.getBoard());
        const query = new BiRequestBuilder()
            .method(Methods.REMOVE_DASHBOARD)
            .params([board.id])
            .build();
        modal.close();
        this.api.execute(query).pipe(first())
            .subscribe(() => {
                this.messages.message(new Message(MessageType.INFO, 'MESSAGES.REMOVED'));
                this.route.navigate([''])
                    .catch(err => console.log(err));
            });
    }

    onExport(): void {
        this.exportSpin = true;
        Export.query(this.api, this.boardService, this.filterService)
            .pipe(first(), finalize(() => this.exportSpin = false))
            .subscribe(
                (response) => Export.save(response.result, this.boardService)
            );
    }

    onChangeLang(lang: string) {
        this.lang = lang;
        this.languageService.use(lang);
    }

    onAddField(modal: ModalComponent) {
        const board = cloneDeep(this.boardService.getBoard());
        const field: Field = {
            name: this.addFieldForm.value.name,
            group: this.addFieldForm.value.group,
            isSelectable: this.addFieldForm.value.filters,
            isGrouping: this.addFieldForm.value.fields,
            expr: null,
            label: null,
            alias: null,
            desc: null,
            order: null,
            format: null,
            description: null,
            dict: null,
            type: null,
            model: null,
            pseudo: false,
            enable: null,
            aggFunc: null,
            hide: null,
            grouped: null,
            datasource: null,
            isAgg: null,
            isSortable: null,
            allowAggFuncs: false
        };

        if (this.addFieldForm.value.name === 'none') {
            return;
        }

        if (this.addFieldForm.value.fields) {
            board.agvFields.push(field);
        }

        if (this.addFieldForm.value.filters) {
            board.filterFields.push(field);
        }

        board.groups = this.filterService.allFilters();
        board.sample = this.filterService.ratioSubject.getValue();

        modal.close();
        const query = new BiRequestBuilder()
            .method(Methods.SET_DASHBOARD)
            .params([board.prepare()])
            .build();
        this.addFieldSubscription = this.api.execute(query)
            .pipe(
                first(),
                map((response) => {
                    this.messages.message(new Message(MessageType.INFO, 'MESSAGES.SAVED'));
                    this.route.navigate(['/']).then(() => {
                            this.route.navigate(['board', response.result])
                                .catch(msg => this.messages.message(new Message(MessageType.DANGER, msg)));
                        }
                    ).catch(msg => this.messages.message(new Message(MessageType.DANGER, msg)));
                })
            ).subscribe();
    }
}
