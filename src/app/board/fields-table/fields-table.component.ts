import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { cloneDeep, remove } from 'lodash';

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
    fields: Field[];
    removeFieldSubscription: Subscription;
    fieldSubscription: Subscription;
    allChecked = false;

    constructor(private datasourceService: DatasourceService,
                private messages: MessageService,
                private authService: AuthenticationService,
                private api: APIService,
                private route: Router,
                private fieldsTableService: FieldsTableService) {
    }

    ngOnInit() {
        this.fieldSubscription = this.datasourceService.tableFields().subscribe(value => this.fields = value);
        this.accessLevel$ = this.authService.accessLevel$;
    }

    onGroupBy(field: Field, control: any): void {
        field.grouped = control.checked;
        this.fieldsTableService.replaceFields(this.makeFields());
        const fieldsInTable = this.fields.filter(field => field.isGrouping);
        this.allChecked = true;
        for (let i = 0; i < fieldsInTable.length; i++) {
            if (!fieldsInTable[i].grouped) {
                this.allChecked = false;
                return;
            }
        }
    }

    onGroupByAll(control: any): void {
        this.allChecked = control.checked;
        for (let i = 0; i < this.fields.length; i++) {
            this.fields[i].grouped = this.allChecked;
        }
        this.fieldsTableService.replaceFields(this.makeFields());
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
        if (this.fieldSubscription) {
            this.fieldSubscription.unsubscribe();
        }
    }

    // private
    makeFields(): Field[] {
        return this.fields.reduce((acc, field) => {
            if (field.isGrouping && field.grouped) {
                field.group = this.board.exportQry.maxGroupBy();
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
                        .isGrouping(false)
                        .build();
                    field.hide = true;
                    this.board.exportQry.params[0].fields = this.board.exportQry.params[0].fields.concat(dictionaryField);
                    acc.push(dictionaryField);
                }
                if ('ip' === field.name) {
                    const ipField = new FieldBuilder()
                        .expr('IPv4NumToString(ip)')
                        .alias('ip_text')
                        .label('IP адрес')
                        .isGrouping(false)
                        .build();
                    field.hide = true;
                    this.board.exportQry.params[0].fields = this.board.exportQry.params[0].fields.concat(ipField);
                    acc.push(ipField);
                }
                this.board.exportQry.params[0].fields = this.board.exportQry.params[0].fields.concat(field);
                acc.push(field);
            }
            if (field.isGrouping && !field.grouped) {
                remove(this.board.exportQry.params[0].fields, (e: Field) => e.expr === field.name);
                if (field.dict || 'ip' === field.name) {
                    remove(this.board.exportQry.params[0].fields, (e: Field) => e.alias === (field.name + '_text'));
                }
            }
            return acc;
        }, [
            new FieldBuilder()
                .alias('qty')
                .desc(true)
                .expr('count()')
                .grouped(false)
                .isGrouping(false)
                .isSelectable(false)
                .label('Кол-во')
                .order(0)
                .build()
        ]);
    }
}
