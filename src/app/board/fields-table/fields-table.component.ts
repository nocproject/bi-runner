import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { findIndex, remove } from 'lodash';

import { Board, Field, FieldBuilder } from '@app/model';
import { DatasourceService } from '../services/datasource-info.service';
import { FieldsTableService } from '../services/fields-table.service';

@Component({
    selector: 'bi-fields',
    templateUrl: './fields-table.component.html',
    styleUrls: ['./fields-table.component.scss']
})
export class FieldsTableComponent implements OnInit {
    @Input()
    board: Board;
    fields$: Observable<Field[]>;

    constructor(private datasourceService: DatasourceService,
                private fieldsTableService: FieldsTableService) {
    }

    ngOnInit() {
        this.fields$ = this.datasourceService.tableFields();
    }

    onGroupBy(field: Field, control: any): void {
        const fields = [];
        const index = findIndex(this.board.exportQry.params[0].fields, e => e.expr === field.name);

        field.grouped = control.checked;
        if (field.grouped && index === -1) {
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
            this.board.exportQry.params[0].fields = this.board.exportQry.params[0].fields.concat(fields);
            this.fieldsTableService.fieldsNext(fields);
        }
        if (!field.grouped && index !== -1) {
            remove(this.board.exportQry.params[0].fields, e => e.expr === field.name);
            if (field.dict || 'ip' === field.name) {
                remove(this.board.exportQry.params[0].fields, e => e.alias === (field.name + '_text'));
            }
            this.fieldsTableService.removeField(field);
        }
    }
}
