import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import * as _ from 'lodash';

import { FieldConfig } from '../models/form-config.interface';
import { Methods, QueryBuilder, Result } from '../../model';
import { APIService } from '../../services';
import { TreeviewComponent, TreeviewItem } from 'ngx-treeview/src';

@Component({
    selector: 'bi-form-dropdown',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => FormDropdownComponent),
        multi: true
    }],
    styles: [`
        .scrollable-menu {
            height: auto;
            max-height: 200px;
            overflow-x: hidden;
            position: relative;
        }
    `],
    template: `
        <div class="dropdown"
             [ngClass]="{'open': open}">
            <button class="dropdown-toggle form-control"
                    style="width: 100%;text-align: left;"
                    [ngClass]="{'open': open}"
                    (click)="openList()">{{ placeholder }}
                <span *ngIf="showRemove" class="pull-right times" (click)="onClean()"></span>
                <span class="pull-right caret" style="margin-top: 9px;"></span></button>
            <div [formGroup]="pattern" *ngIf="open">
                <input formControlName="term" class="form-control"
                       [placeholder]="'DROP_DOWN.ENTER_PATTERN' | translate">
                <div><a class="not-active" *ngIf="notFound" translate>DROP_DOWN.NOT_FOUND</a></div>
                <div *ngIf="search"><a class="not-active" translate>DROP_DOWN.SEARCHING</a></div>
            </div>
            <ul class="dropdown-menu scrollable-menu"
                style="width: 100%;"
                [ngStyle]="{'display': (!notFound && !search && open) ? 'block' : 'none'}">
                <li *ngIf="config.type === 'dictionary'; else tree">
                    <a class="hand" (click)="onSelect(row)"
                       *ngFor="let row of (list$ | async) as list">{{ row[1] }}</a>
                </li>
            </ul>
        </div>
        <ng-template #tree>
            <ngx-treeview
                    #treeView
                    [config]="treeConfig"
                    [items]="(list$ | async)"
                    (selectedChange)=onTreeSelect(treeView)>
            </ngx-treeview>
        </ng-template>
    `
})
export class FormDropdownComponent implements OnInit, OnDestroy, ControlValueAccessor {
    private propagateChange: (_: any) => void;
    private subscription: Subscription;

    @Input()
    config: FieldConfig;
    @Input()
    showRemove: boolean = false;
    @Output()
    select: EventEmitter<any> = new EventEmitter<any>();

    list$: Observable<any[]>;
    pattern: FormGroup;
    placeholder: string;
    open = false;
    search = false;
    notFound = false;
    treeConfig = {
        hasAllCheckBox: false,
        hasFilter: false,
        hasCollapseExpand: false
    };

    constructor(private api: APIService,
                private _element: ElementRef) {
    }

    ngOnInit(): void {
        this.pattern = new FormGroup({
            'term': new FormControl('')
        });
        this.list$ = this.api.execute(
            this.makeQuery())
            .map(response => this.response(response))
            .do(data => {
                this.search = false;
                this.notFound = data.length === 0;
            });
        this.subscription = this.pattern.valueChanges
            .subscribe(data => {
                this.search = true;
                this.notFound = false;
                this.list$ = this.api.execute(
                    this.makeQuery(data.term))
                    .map(response => this.response(response))
                    .do(data => {
                        this.search = false;
                        this.notFound = data.length === 0;
                    });
            });
        this.placeholder = `Choose ${this.config.description ? this.config.description : 'Value'}`;
        if (this.config.value) { // restore by Id
            if (this.config.type === 'dictionary') {
                this.api.execute(
                    new QueryBuilder()
                        .method(Methods.QUERY)
                        .params([{
                            fields: [
                                {
                                    expr: {
                                        $lookup: [
                                            this.config.dict,
                                            {
                                                $field: `toUInt64(${this.config.value})`
                                            }
                                        ]
                                    },
                                    alias: 'value',
                                    group: 0
                                }
                            ],
                            datasource: this.config.datasource
                        }])
                        .build())
                    .first()
                    .subscribe(response => this.placeholder = response.result.result[0][0]);
            }
        }
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: any): void {
        if (event.button !== 2 &&
            !this._element.nativeElement.contains(event.target)) {
            this.open = false;
        }
    }

    @HostListener('keyup.esc')
    onEsc(): void {
        this.open = false;
    }

    writeValue(obj: any): void {
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState(isDisabled: boolean): void {
        throw new Error('Method not implemented.');
    }

    openList() {
        this.open = !this.open;
    }

    onClean() {
        this.propagateChange(null);
        this.open = false;
        this.placeholder = `Choose ${this.config.expr}`;
        this.select.emit();
        event.stopPropagation();
    }

    onSelect(row: any[]) {
        this.propagateChange(row[0]);
        this.open = false;
        this.placeholder = row[1];
        this.select.emit();
    }

    onTreeSelect(treeView: TreeviewComponent) {
        traverse(treeView.items, (leaf) => {
            if (leaf.checked) {
                if(!_.includes(this.config.value, leaf.value)){
                    this.config.value.push(leaf.value)
                }
            } else {
                _.remove(this.config.value, n => n === leaf.value);
            }
        });
        this.propagateChange(this.config.value);
        this.select.emit();
        this.placeholder = `selected: ${this.config.value.length} nodes`;
        console.log(this.config.value);
    }

    private makeQuery(term?: string) {
        let method;
        let params;

        switch (this.config.type) {
            case 'dictionary':
                method = Methods.QUERY;
                params = dictionaryQuery(this.config, term);
                break;
            case 'tree':
                method = Methods.GET_HIERARCHY;
                params = treeQuery(this.config, term);
                break;
        }
        return new QueryBuilder()
            .id(2)
            .method(method)
            .params([params])
            .build();
    }

    // ToDo after delete first version of BI, refactor 'get_hierarchy' backend method!!!!
    private response(response: Result) {
        if (this.config.type === 'dictionary') {
            return response.result.result;
        } else {
            if (_.isEmpty(response.result)) {
                return [];
            }
            traverse([response.result], (leaf) => {
                leaf.value = leaf.id;
                leaf.checked = _.includes(this.config.value, leaf.id);
            });
            return [new TreeviewItem(response.result)];
        }
    }
}

function dictionaryQuery(config: FieldConfig, term?: string) {
    const query = {
        fields: [
            {
                expr: config.expr,
                group: 0
            }, {
                expr: {
                    $lookup: [
                        config.dict,
                        {
                            $field: config.expr
                        }
                    ]
                },
                alias: 'value',
                order: 0
            }
        ],
        datasource: config.datasource,
        limit: 500
    };
    if (term) {
        query['filter'] = {
            $like: [
                {
                    $lower: {$field: 'value'}
                }, {
                    $lower: `%${term}%`
                }
            ]
        };
    }
    return query;
}

function treeQuery(config: FieldConfig, term?: string) {
    const query = {
        datasource: config.datasource,
        field_name: config.expr,
        dic_name: config.dict
    };

    if (term) {
        query['filter'] = term;
    }

    return query;
}

function traverse(tree, func) {
    tree.forEach(leaf => {
            func(leaf);
            if (leaf.hasOwnProperty('children') || (leaf instanceof TreeviewItem && leaf.children)) {
                traverse(leaf.children, func);
            } else {
                return;
            }
        }
    );
}