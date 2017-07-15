import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { Methods } from '../model';
import { GridConfig, GridConfigBuilder } from '../shared/data-grid/data-grid.component';

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
        this.tableConfig = new GridConfigBuilder()
            .headers(['Title', 'Description', 'Owner', 'Created', 'Changed'])
            .names(['title', 'description', 'owner', 'created', 'changed'])
            .fromJson(tableJson)
            .method(Methods.LIST_DASHBOARDS)
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
