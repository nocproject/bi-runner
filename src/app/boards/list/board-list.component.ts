import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import * as moment from 'moment';

import { Message, MessageType, Methods, BiRequestBuilder } from '../../model';
import { APIService, MessageService } from '../../services';
import { GridConfig, GridConfigBuilder } from '../../shared/data-grid/data-grid.component';

@Component({
    selector: 'bi-board-list',
    templateUrl: './board-list.component.html',
    styleUrls: ['./board-list.component.scss']
})
export class BoardListComponent implements OnInit {
    tableConfig: GridConfig;
    selected: string[] = [];
    showSpinner = true;

    constructor(private api: APIService,
                private route: Router,
                private messages: MessageService,
                private location: Location) {
    }

    ngOnInit() {
        this.tableConfig = new GridConfigBuilder()
            .headers(['LIST.NAME', 'LIST.DESCRIPTION', 'LIST.OWNER', 'LIST.CREATED', 'LIST.CHANGED'])
            .names(['title', 'description', 'owner', 'created', 'changed'])
            .fromJson(tableJson)
            .data(this.api
                .execute(new BiRequestBuilder().method(Methods.LIST_DASHBOARDS).params([{version: 2}]).build())
                .do(() => this.showSpinner = false)
                .map(response => response.result.map(row =>
                    Object.assign({}, row,
                        {changed: moment(row.changed).format('DD.MM.YYYY HH:mm')},
                        {created: moment(row.created).format('DD.MM.YYYY HH:mm')}
                    )
                )))
            .build();
    }

    onOpen(): void {
        if (this.selected.length === 1) {
            this.showSpinner = true;
            this.route.navigate(['board', this.selected[0]])
                .catch(msg => console.log(msg));
            this.selected = [];
        }
    }

    onSelected(id: string[]) {
        this.selected = id;
        this.onOpen();
    }

    onCancel(): void {
        this.location.back();
    }

    onImport(file, el: HTMLInputElement) {
        let reader = new FileReader();

        reader.onload = () => {
            let query;

            try {
                query = JSON.parse(reader.result);
            } catch (error) {
                this.messages.message(new Message(MessageType.DANGER, error));
            }

            this.api.execute(query).first()
                .finally(() => el.value = '')
                .subscribe((response) => {
                    this.messages.message(new Message(MessageType.INFO, 'MESSAGES.IMPORTED'));
                    this.route.navigate(['board', response.result])
                        .catch(msg => this.messages.message(new Message(MessageType.DANGER, msg)));
                });

        };
        reader.readAsText(file.target.files[0]);
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
