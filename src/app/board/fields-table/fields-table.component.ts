import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable ,  Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { cloneDeep, findIndex, remove } from 'lodash';

import { BiRequestBuilder, Board, Field, FieldBuilder, Message, MessageType, Methods } from '@app/model';
import { FieldsTableService } from '../services/fields-table.service';
import { APIService, AuthenticationService, DatasourceService, MessageService } from '@app/services';

@Component({
    selector: 'bi-fields',
    templateUrl: './fields-table.component.html',
    styleUrls: ['./fields-table.component.scss']
})
export class FieldsTableComponent implements OnInit, OnDestroy {
    @Input()
    board: Board;
    accessLevel$: Observable<number>;
    fields$: Observable<Field[]>;
    removeFieldSubscription: Subscription;

    constructor(private datasourceService: DatasourceService,
                private messages: MessageService,
                private authService: AuthenticationService,
                private api: APIService,
                private route: Router,
                private fieldsTableService: FieldsTableService) {
    }

    ngOnInit() {
        this.fields$ = this.datasourceService.tableFields();
        this.accessLevel$ = this.authService.accessLevel$;
    }

    onGroupBy(field: Field, control: any): void {
        const fields = [];
        const index = findIndex(this.board.export.params[0].fields, e => e.expr === field.name);

        field.grouped = control.checked;
        if (field.grouped && index === -1) {
            field.group = this.board.export.maxGroupBy();
            field.expr = field.name;
            field.label = field.description;
            if (field.dict) {
                const dictionaryField = new FieldBuilder()
                    .label(field.description)
                    .expr({
                        $lookup: [
                            field.dict,
                            {
                                $field: field.name
                            }
                        ]
                    })
                    .alias(field.name + '_text')
                    .build();
                field.hide = true;
                fields.push(dictionaryField);
            }
            if ('ip' === field.name) {
                fields.push(new FieldBuilder()
                    .expr('IPv4NumToString(ip)')
                    .alias('ip_text')
                    .label('IP адрес')
                    .build()
                );
                field.hide = true;
            }
            fields.push(field);
            this.board.export.params[0].fields = this.board.export.params[0].fields.concat(fields);
            this.fieldsTableService.fieldsNext(fields);
        }
        if (!field.grouped && index !== -1) {
            remove(this.board.export.params[0].fields, e => e.expr === field.name);
            if (field.dict || 'ip' === field.name) {
                remove(this.board.export.params[0].fields, e => e.alias === (field.name + '_text'));
            }
            this.fieldsTableService.removeField(field);
        }
    }

    onRemove(field: Field): void {
        const board = cloneDeep(this.board);
        board.agvFields = board.agvFields.filter(f => f.name !== field.name);
        this.board.agvFields = board.agvFields;
        board.filterFields = board.filterFields.filter(f => f.name !== field.name);
        const query = new BiRequestBuilder()
            .method(Methods.SET_DASHBOARD)
            .params([board.prepare()])
            .build();

        this.removeFieldSubscription = this.api.execute(query)
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

    ngOnDestroy(): void {
        if (this.removeFieldSubscription) {
            this.removeFieldSubscription.unsubscribe();
        }
    }
}
