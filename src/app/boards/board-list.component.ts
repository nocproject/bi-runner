import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { Board, Methods, QueryBuilder } from '../model';
import { APIService } from '../services';
import { Router } from '@angular/router';

@Component({
    selector: 'bi-board-list',
    templateUrl: './board-list.component.html',
    styleUrls: ['./board-list.component.scss']
})
export class BoardListComponent implements OnInit {

    result: Board[];
    scrollDistance = 1;
    scrollThrottle = 250;
    selected: string;

    constructor(private api: APIService,
                private route: Router,
                private location: Location) {
        this.api.execute(new QueryBuilder().method(Methods.LIST_DASHBOARDS).build())
            .subscribe(
                result => this.result = result.data.map(item => Board.fromJSON(item)),
                console.error
            );
    }

    ngOnInit() {
    }

    onModalScrollDown() {
        // ToDo remove infiniteScroll
        console.log('onModalScrollDown');
    }

    isSelected(row: Board): boolean {
        return this.selected === row.id;
    }

    onOpen(id: string): void {
        let selected = this.selected;

        if (id) {
            selected = id;
        }

        this.route.navigate(['board', selected]);
    }

    onClick(id: string): void {
        if (this.selected === id) {
            this.selected = '';
        } else {
            this.selected = id;
        }
    }

    onCancel(): void {
        this.location.back();
    }
}
