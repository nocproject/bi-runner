import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { FilterControl } from '../../models/field.interface';
import { FieldConfig } from '../../models/form-config.interface';
import { APIService } from '../../../services/api.service';
import { Methods, QueryBuilder } from '../../../model';

@Component({
    selector: 'bi-form-dictionary',
    styleUrls: ['./form-dictionary.component.scss'],
    template: `
        <div class="form-group" [formGroup]="form">
            <label class="control-label">{{ config.label }}:</label>
            <div class="dropdown"
                 [ngClass]="{'open': isOpen}">
                <button class="dropdown-toggle form-control"
                        biDict
                        style="width: 100%;text-align: left;"
                        [ngClass]="{'open': isOpen}"
                        (click)="openList()">{{ selected }}
                    <span class="pull-right caret" style="margin-top: 9px;"></span></button>
                <ul class="dropdown-menu scrollable-menu" style="width: 100%;" [formGroup]="pattern">
                    <input formControlName="term" class="form-control" style="margin: 0 20px 5px 20px;width: 90%">
                    <li><a class="hand" (click)="onSelect(row)"
                           *ngFor="let row of (list$ | async)">{{ row[1] }}</a></li>
                </ul>
            </div>
        </div>
    `
})
export class FormDictionaryComponent implements FilterControl, OnInit, AfterContentInit, OnDestroy {
    private subscription: Subscription;
    config: FieldConfig;
    form: FormGroup;
    pattern: FormGroup;
    list$: Observable<any[]>;
    selected: string = 'Select Value';
    isOpen = false;

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
                .params([this.query(this.config)])
                .build())
            .map(response => response.result.result);
        if (this.config.value) {
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
                .then(response => this.selected = response.result.result[0][0]);
        }
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngAfterContentInit(): void {
        this.subscription = this.pattern.valueChanges
            .subscribe(data => this.list$ = this.api.execute(
                new QueryBuilder()
                    .id(2)
                    .method(Methods.QUERY)
                    .params([this.query(this.config, data.term)])
                    .build())
                .map(response => response.result.result));
    }

    openList() {
        this.isOpen = !this.isOpen;
    }

    onSelect(row: any[]) {
        this.form.patchValue({valueFirst: row[0]});
        this.isOpen = false;
        this.selected = row[1];
    }

    private query(config: FieldConfig, term?: string) {
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
        console.log(query);
        return query;
    }
}
