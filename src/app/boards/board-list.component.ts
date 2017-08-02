import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { Methods, QueryBuilder } from '../model';
import { GridConfig, GridConfigBuilder } from '../shared/data-grid/data-grid.component';
import { APIService } from '../services/api.service';

@Component({
    selector: 'bi-board-list',
    templateUrl: './board-list.component.html'
})
export class BoardListComponent implements OnInit {
    tableConfig: GridConfig;
    selected: string[] = [];

    constructor(private api: APIService,
                private route: Router,
                private location: Location) {
    }

    ngOnInit() {
        this.tableConfig = new GridConfigBuilder()
            .headers(['LIST.NAME', 'LIST.DESCRIPTION', 'LIST.OWNER', 'LIST.CREATED', 'LIST.CHANGED'])
            .names(['title', 'description', 'owner', 'created', 'changed'])
            .fromJson(tableJson)
            .data(this.api
                .execute(new QueryBuilder().method(Methods.LIST_DASHBOARDS).build())
                .map(response => response.result)
                .flatMap(rows => rows)
                .filter(row => row['format'] === '2')
                .toArray())
            .build();
    }

    onOpen(): void {
        if (this.selected.length === 1) {
            this.route.navigate(['board', this.selected[0]])
                .catch(msg => console.log(msg));
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
