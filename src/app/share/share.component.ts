import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject ,  Observable ,  Subscription } from 'rxjs';
import { first, flatMap, map, pluck, switchMap, toArray } from 'rxjs/operators';

import { concat, includes, remove } from 'lodash';

import { APIService, MessageService } from '@app/services';
import { AccessLevel, BiRequestBuilder, Board, Message, MessageType, Methods } from '@app/model';
import { GridConfig, GridConfigBuilder } from '../shared/data-grid/data-grid.component';
import { ModalComponent } from '../shared/modal/modal';

@Component({
    selector: 'bi-share',
    templateUrl: './share.component.html'
})
export class ShareComponent implements OnInit, OnDestroy {
    @ViewChild(ModalComponent)
    confirmDialog: ModalComponent;
    boardId: string;
    title: string;
    userConfig: GridConfig;
    groupConfig: GridConfig;
    accessCache: Access[] = [];
    preSelected: any[] = [];
    unsavedData = false;
    config: GridConfig;
    chooseForm: FormGroup;
    shareSpin = false;
    trashSpin = false;
    private chooseSubscription: Subscription;
    private confirmAnswerSubject = new BehaviorSubject(null);
    confirmAnswer$: Observable<boolean> = this.confirmAnswerSubject.asObservable();

    constructor(private api: APIService,
                private messages: MessageService,
                private route: ActivatedRoute,
                private router: Router) {
    }

    ngOnInit() {
        const init: Choose = {object: 'group', access: AccessLevel.READ_ONLY};

        this.userConfig = new GridConfigBuilder()
            .headers(['SHARE.USERNAME', 'SHARE.FULL_NAME'])
            .names(['username', 'full_name'])
            .data(this.api
                .execute(new BiRequestBuilder().method(Methods.LIST_USERS).build()).pipe(
                map(response => response.result))
            )
            .fromJson(userJson)
            .build();

        this.groupConfig = new GridConfigBuilder()
            .headers(['SHARE.GROUP_NAME'])
            .names(['name'])
            .data(this.api
                .execute(new BiRequestBuilder().method(Methods.LIST_GROUPS).build()).pipe(
                map(response => response.result))
            )
            .fromJson(groupJson)
            .build();

        this.chooseForm = new FormGroup({
                object: new FormControl(init.object),
                access: new FormControl('' + init.access)
            }
        );

        this.route.data.pipe(
            pluck('detail'),
            switchMap((board: Board) => {
                this.boardId = board.id;
                this.title = board.title;
                this.config = this.configGrid(init);
                return this.initCacheAccess(board.id);
            })
        ).subscribe(data => {
                this.accessCache = data;
                this.preSelected = this.getAccess(init);
            }
        );

        this.chooseSubscription = this.chooseForm
            .valueChanges
            .subscribe((data: Choose) => {
                this.config = this.configGrid(data);
                this.preSelected = this.getAccess(data);
            });
    }

    ngOnDestroy(): void {
        this.chooseSubscription.unsubscribe();
    }

    onSelected(ids: any[]) {
        this.preSelected = ids;
        this.unsavedData = true;
        this.updateAccess(this.chooseForm.value);
    }

    onCloseConfirm() {
        this.confirmAnswerSubject.next(false);
    }

    onConfirm(answer: boolean) {
        this.confirmDialog.close();
        this.confirmAnswerSubject.next(answer);
        if (answer) {
            this.onCancel();
        }
    }

    // buttons
    onShare() {
        this.shareSpin = true;
        this.api.execute(new BiRequestBuilder()
        // .method(`set_dashboard_access_${this.chooseForm.value.object}`)
            .method(Methods.SET_DASHBOARD_ACCESS)
            .params([
                {id: this.boardId},
                {items: this.accessCache}
            ])
            .build())
            .pipe(first())
            .subscribe(() => {
                    this.unsavedData = false;
                    this.shareSpin = false;
                    this.messages.message(new Message(MessageType.INFO, 'MESSAGES.SHARE_SAVED'));
                },
                () => this.shareSpin = false);
    }

    onRemoveAll() {
        this.trashSpin = true;
        this.api.execute(new BiRequestBuilder()
            .method(Methods.SET_DASHBOARD_ACCESS)
            .params([
                {id: this.boardId},
                {items: []}
            ])
            .build())
            .pipe(first())
            .subscribe(() => {
                this.trashSpin = false;
                this.unsavedData = false;
                this.accessCache = [];
                this.preSelected = [];
                this.messages.message(new Message(MessageType.INFO, 'MESSAGES.SHARE_REMOVED'));
            });
    }

    onCancel(): void {
        this.router.navigate(['board', this.boardId]);
    }

    private configGrid(data: Choose) {
        switch (data.object) {
            case 'user':
                return this.userConfig;
            case 'group':
                return this.groupConfig;
        }
    }

    private initCacheAccess(boardId: string): Observable<Access[]> {
        return this.api.execute(
            new BiRequestBuilder()
                .method(Methods.GET_DASHBOARD_ACCESS)
                .params([{id: boardId}])
                .build())
            .pipe(
                flatMap(response => response.result),
                map(item => {
                    if (item.hasOwnProperty('user')) {
                        return <Access>({user: {id: item['user'].id}, level: Number(item['level'])});
                    } else {  // if (item.hasOwnProperty('group')) {
                        return <Access>{group: {id: item['group'].id}, level: Number(item['level'])};
                    }
                }),
                toArray()
            );
    }

    private getAccess(choose: Choose): any[] {
        return this.accessCache
            .filter(item => Number(item['level']) === Number(choose.access))
            .filter(item => item.hasOwnProperty(choose.object))
            .map(item => item[choose.object].id);
    }

    private updateAccess(choose: Choose) {
        remove(this.accessCache, e => Number(e['level']) === Number(choose.access) && e.hasOwnProperty(choose.object));
        remove(this.accessCache, e => e.hasOwnProperty(choose.object) && includes(this.preSelected, e[choose.object].id));
        const items = this.preSelected.map(id => {
            if (choose.object === 'user') {
                return <Access>({user: {id: id}, level: Number(choose.access)});
            } else {  // if 'group'
                return <Access>{group: {id: id}, level: Number(choose.access)};
            }
        });
        this.accessCache = concat(this.accessCache, items);
    }
}

class Access {
    user: User;
    group: Group;
    level: AccessLevel;
}

interface Group {
    id: number;
    name: string;
}

interface User {
    id: number;
    username: string;
    full_name: string;
}

interface Choose {
    object: string;
    access: AccessLevel;
}

function userJson(item): User {
    return {id: item.id, username: item.username, full_name: item.full_name};
}

function groupJson(item): Group {
    return {id: item.id, name: item.name};
}
