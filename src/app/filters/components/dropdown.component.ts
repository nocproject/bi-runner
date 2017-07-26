import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { FieldConfig } from '../models/form-config.interface';
import { Methods, QueryBuilder } from '../../model';
import { APIService } from '../../services';

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
                <input formControlName="term" class="form-control" placeholder="enter pattern">
                <div><a class="not-active" *ngIf="notFound">not found</a></div>
                <div *ngIf="search"><a class="not-active">searching...</a></div>
            </div>
            <ul class="dropdown-menu scrollable-menu"
                style="width: 100%;"
                [ngStyle]="{'display': (!notFound && !search && open) ? 'block' : 'none'}">
                <li><a class="hand" (click)="onSelect(row)"
                       *ngFor="let row of (list$ | async) as list">{{ row[1] }}</a></li>
            </ul>
        </div>
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

    constructor(private api: APIService) {
    }

    ngOnInit(): void {
        this.pattern = new FormGroup({
            'term': new FormControl('')
        });

        this.list$ = this.api.execute(
            new QueryBuilder()
                .id(1)
                .method(Methods.QUERY)
                .params([query(this.config)])
                .build())
            .map(response => response.result.result)
            .do(data => {
                this.search = false;
                this.notFound = data.length === 0;
            });
        this.subscription = this.pattern.valueChanges
            .subscribe(data => {
                this.search = true;
                this.notFound = false;
                this.list$ = this.api.execute(
                    new QueryBuilder()
                        .id(2)
                        .method(Methods.QUERY)
                        .params([query(this.config, data.term)])
                        .build())
                    .map(response => response.result.result)
                    .do(data => {
                        this.search = false;
                        this.notFound = data.length === 0;
                    });
            });
        this.placeholder = `Choose ${this.config.description ? this.config.description : 'Value'}`;
        if (this.config.value) { // restore by Id
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
                .toPromise()
                .then(response => this.placeholder = response.result.result[0][0]);
        }

    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
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
}

function query(config: FieldConfig, term?: string) {
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
