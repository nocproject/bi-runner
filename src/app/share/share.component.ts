import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { AccessLevel, Board, Methods } from '../model';
import { APIService } from '../services/api.service';
import { GridConfig, GridConfigBuilder } from '../shared/data-grid/data-grid.component';
import { QueryBuilder } from '../model/query.builder';

@Component({
    selector: 'bi-share',
    templateUrl: './share.component.html',
    styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit, OnDestroy {
    private paramSubscription: Subscription;
    private chooseSubscription: Subscription;
    private accessSubscription: Subscription;

    board: Board;
    userConfig: GridConfig;
    groupConfig: GridConfig;
    preSelected: any[] = [];
    config: GridConfig;
    chooseForm: FormGroup;
    shareSpin = false;

    constructor(private api: APIService,
                private route: ActivatedRoute,
                private location: Location) {
    }

    ngOnInit() {
        const init: Choose = {object: 'group', access: AccessLevel.READ_ONLY};

        this.userConfig = new GridConfigBuilder()
            .headers(['Username', 'Full Name'])
            .names(['username', 'full_name'])
            .method(Methods.LIST_USERS)
            .fromJson(userJson)
            .build();

        this.groupConfig = new GridConfigBuilder()
            .headers(['Name'])
            .names(['name'])
            .method(Methods.LIST_GROUPS)
            .fromJson(groupJson)
            .build();

        this.chooseForm = new FormGroup({
                object: new FormControl(init.object),
                access: new FormControl('' + init.access)
            }
        );

        this.paramSubscription = this.route.data.map(data => data['detail'])
            .subscribe(
                (board: Board) => {
                    this.board = board;
                }
            );

        this.config = this.configGrid(init);

        this.chooseSubscription = this.chooseForm
            .valueChanges
            .subscribe((data: Choose) => {
                this.config = this.configGrid(data);
            });
    }

    ngOnDestroy(): void {
        this.paramSubscription.unsubscribe();
        this.chooseSubscription.unsubscribe();
        this.accessSubscription.unsubscribe();
    }

    configGrid(data: Choose) {
        this.getAccess(data);
        switch (data.object) {
            case 'user':
                return this.userConfig;
            case 'group':
                return this.groupConfig;
        }
    }

    onSelected(ids: any[]) {
        this.preSelected = ids;
    }

    // buttons
    onShare() {
        const items = this.preSelected.map(id => {
            return {
                [this.chooseForm.value.object]: {
                    'id': id
                },
                'level': Number(this.chooseForm.value.access)
            };
        });
        console.log(items);

        this.shareSpin = true;
        this.api.execute(new QueryBuilder()
            .method(`set_dashboard_access_${this.chooseForm.value.object}`)
            .params([
                {id: this.board.id},
                {items: items}
            ])
            .build())
            .subscribe(response=>console.log(response),
                error=>console.log(error),
                ()=>this.shareSpin = false);
    }

    onRemoveAll() {
        // console.log(this.chooseForm.value);
        // console.log(this.board.id);
        this.api.execute(new QueryBuilder()
        // .method(`set_dashboard_access_${this.chooseForm.value.object}`)
            .method(Methods.SET_DASHBOARD_ACCESS)
            .params([
                {id: this.board.id},
                {items: []}
            ])
            .build())
            .subscribe(console.log);
        this.location.back();
    }

    onCancel(): void {
        this.location.back();
    }

    private getAccess(data: Choose): void {
        this.accessSubscription = this.api.execute(
            new QueryBuilder()
                .method(Methods.GET_DASHBOARD_ACCESS)
                .params([{id: this.board.id}])
                .build())
            .flatMap(response => response.result)
            .filter(item => Number(item['level']) === Number(data.access))
            .filter(item => item.hasOwnProperty(data.object))
            .map(item => item[data.object].id)
            .toArray()
            .subscribe(data => this.preSelected = data);
    }
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
