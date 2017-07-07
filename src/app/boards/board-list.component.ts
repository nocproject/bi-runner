import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Methods } from '../model';
import { GridConfig } from '../shared/data-grid/data-grid.component';

@Component({
    selector: 'bi-board-list',
    templateUrl: './board-list.component.html',
    styleUrls: ['./board-list.component.scss']
})
export class BoardListComponent implements OnInit {
    tableConfig: GridConfig;
    selected: string[] = [];

    constructor(private route: Router,
                private location: Location) {
    }

    ngOnInit() {
        this.tableConfig = new GridConfig();
        this.tableConfig.headers = ['Title', 'Description', 'Owner', 'Created', 'Changed'];
        this.tableConfig.names = ['title', 'description', 'owner', 'created', 'changed'];
        this.tableConfig.method = Methods.LIST_DASHBOARDS;
        this.tableConfig.fromJson = tableJson;
    }

    onOpen(): void {
        if (this.selected.length === 1) {
            this.route.navigate(['board', this.selected[0]]);
        }
    }

    onSelected(id: string[]) {
        this.selected = id;
        this.onOpen();
    }

    onCancel(): void {
        this.location.back();
    }
}

function tableJson(item) {
    return {
        id: item.id,
        title: item.title,
        description: item.description,
        owner: item.owner,
        created: item.created,
        changed: item.changed
    };
}
