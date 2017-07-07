import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';

import { FieldListService, FilterService } from '../../../services';
import { Board, Field } from '../../../model';

@Component({
    selector: 'bi-groupby',
    templateUrl: './groupby.component.html',
    styleUrls: ['./groupby.component.scss']
})
export class GroupByComponent implements OnInit {

    @Input()
    board: Board;
    fields$: Observable<Field[]>;

    constructor(private fieldList: FieldListService,
                private filterService: FilterService) {
    }

    ngOnInit() {
        this.fields$ = this.fieldList.getFieldList();
    }

    onGroupBy(field: Field, control: any): void {
        const fields = [];
        const index = _.findIndex(this.board.exportQry.params[0].fields, e => e.expr === field.name);

        field.grouped = control.checked;
        if (field.grouped && index === -1) {
            field.group = this.board.exportQry.maxGroup();
            field.expr = field.name;
            if (field.dict) {
                const dictionaryField = new Field();

                dictionaryField.expr = {
                    $lookup: [
                        field.dict,
                        {
                            $field: field.name
                        }
                    ]
                };
                dictionaryField.alias = field.name + '_text';
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
            _.remove(this.board.exportQry.params[0].fields, e => e.expr === field.name);
            this.filterService.removeGroup(field);
        }
    }
}
