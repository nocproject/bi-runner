import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';

import { Store } from '@ngrx/store';
import * as fromBoard from '../reducers';
import * as fieldAction from '../actions/fields';

import { Board, Field } from 'app/model';
import { FilterService } from 'app/services';

@Component({
    selector: 'bi-fields',
    templateUrl: './fields.component.html',
    styleUrls: ['./fields.component.scss']
})
export class FieldsComponent implements OnInit {
    @Input()
    board: Board;
    fields$: Observable<Field[]>;

    constructor(private filterService: FilterService,
                private store: Store<fromBoard.State>) {
    }

    ngOnInit() {
        this.fields$ = this.store.select(fromBoard.selectAllFields);
    }

    onGroupBy(field: Field, control: any): void {
        const fields = [];
        const _field = _.clone(field);
        const index = _.findIndex(this.board.exportQry.params[0].fields, e => e.expr === _field.name);

        _field.grouped = control.checked;
        if (_field.grouped && index === -1) {
            _field.group = this.board.exportQry.maxGroup();
            _field.expr = _field.name;
            _field.label = _field.description;
            if (_field.dict) {
                const dictionaryField = new Field();

                dictionaryField.label = _field.description;
                dictionaryField.expr = {
                    $lookup: [
                        _field.dict,
                        {
                            $field: _field.name
                        }
                    ]
                };
                dictionaryField.alias = _field.name + '_text';
                _field.hide = true;
                fields.push(dictionaryField);
            }
            if ('ip' === _field.name) {
                fields.push({
                    expr: 'IPv4NumToString(ip)',
                    alias: 'ip_text'
                });
            }
            fields.push(_field);
            this.board.exportQry.params[0].fields = this.board.exportQry.params[0].fields.concat(fields);
            this.filterService.groupsNext(fields);
        }
        if (!_field.grouped && index !== -1) {
            _.remove(this.board.exportQry.params[0].fields, e => e.expr === _field.name);
            if (_field.dict || 'ip' === _field.name) {
                _.remove(this.board.exportQry.params[0].fields, e => e.alias === (_field.name + '_text'));
            }
            this.filterService.removeGroup(_field);
        }
        this.store.dispatch(new fieldAction.UpdateField({ field: { id: _field.name, changes: _field } }));
    }
}
