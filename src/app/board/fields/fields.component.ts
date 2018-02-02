import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { findIndex, remove } from 'lodash';

import { Board, Field, FieldBuilder } from '@app/model';
import { DatasourceService } from '../services/datasource-info.service';
import { FilterService } from '../services/filter.service';

@Component({
    selector: 'bi-fields',
    templateUrl: './fields.component.html',
    styleUrls: ['./fields.component.scss']
})
export class FieldsComponent implements OnInit {
    @Input()
    board: Board;
    fields$: Observable<Field[]>;

    constructor(private datasourceService: DatasourceService,
                private filterService: FilterService) {
    }

    ngOnInit() {
        this.fields$ = this.datasourceService.fields();
    }

    onGroupBy(field: Field, control: any): void {
        const fields = [];
        const index = findIndex(this.board.exportQry.params[0].fields, e => e.expr === field.name);

        field.grouped = control.checked;
        if (field.grouped && index === -1) {
            field.group = this.board.exportQry.maxGroup();
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
                    .alias(field.name + '_text');
                field.hide = true;
                fields.push(dictionaryField);
            }
            if ('ip' === field.name) {
                fields.push({
                    expr: 'IPv4NumToString(ip)',
                    alias: 'ip_text'
                });
            }
            fields.push(field);
            this.board.exportQry.params[0].fields = this.board.exportQry.params[0].fields.concat(fields);
            this.filterService.groupsNext(fields);
        }
        if (!field.grouped && index !== -1) {
            remove(this.board.exportQry.params[0].fields, e => e.expr === field.name);
            if (field.dict || 'ip' === field.name) {
                remove(this.board.exportQry.params[0].fields, e => e.alias === (field.name + '_text'));
            }
            this.filterService.removeGroup(field);
        }
    }
}
