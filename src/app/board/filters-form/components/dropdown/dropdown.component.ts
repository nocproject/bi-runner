import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { first, map, tap } from 'rxjs/operators';

import { includes, isEmpty, isNil, remove } from 'lodash';
import { TreeviewComponent, TreeviewItem } from 'ngx-treeview';
import { TranslateService } from '@ngx-translate/core';

import { BiRequestBuilder, Field, Methods, Result } from '@app/model';
import { FieldConfig } from '../../model/filters-form-config.interface';
import { APIService } from '@app/services';

// import { FieldConfig } from '../../model/filters-form-config.interface';

@Component({
    selector: 'bi-dropdown',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BiDropdownComponent),
            multi: true
        }
    ],
    styleUrls: ['dropdown.component.scss'],
    templateUrl: 'dropdown.component.html'
})
export class BiDropdownComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
    @Input()
    config: FieldConfig;
    @Input()
    field: Field;
    @Input()
    showRemove: boolean = false;
    @Output()
    select: EventEmitter<any> = new EventEmitter<any>();
    list$: Observable<any>;
    pattern: FormGroup;
    placeholder: string;
    open = false;
    search = true;
    notFound = true;
    treeConfig = {
        hasAllCheckBox: false,
        hasFilter: false,
        hasCollapseExpand: false,
        decoupleChildFromParent: false
    };
    private propagateChange: (_: any) => void;
    private searchSubscription: Subscription;

    constructor(private api: APIService,
                private translate: TranslateService,
                private _element: ElementRef) {
    }

    ngOnInit(): void {
        this.pattern = new FormGroup({
            'term': new FormControl('')
        });
        this.searchSubscription = this.pattern.valueChanges
            .subscribe(data => {
                this.search = true;
                this.notFound = false;
                this.list$ = this.api.execute(
                    this.makeQuery(data.term))
                    .pipe(
                        map(response => this.response(response)),
                        tap(data => {
                            this.search = false;
                            this.notFound = data.length === 0;
                        })
                    );
            });
        if (this.config.value) { // restore by Id
            let params;
            switch (this.config.type) {
                case 'dictionary': {
                    params = [
                        {
                            fields: [
                                {
                                    expr: {
                                        $lookup: [
                                            this.field.dict,
                                            {
                                                $field: `toUInt64(${this.config.value})`
                                            }
                                        ]
                                    },
                                    alias: 'value',
                                    group: 0
                                }
                            ],
                            datasource: this.field.datasource
                        }
                    ];
                    this.api.execute(
                        new BiRequestBuilder()
                            .method(Methods.QUERY)
                            .params(params)
                            .build())
                        .pipe(first())
                        .subscribe(response => this.placeholder = response.result.result[0][0]);
                    break;
                }
                case 'string': {
                    params = [
                        {
                            fields: [
                                {
                                    expr: 'name',
                                    alias: 'value',
                                    order: 0
                                }
                            ],
                            filter: {
                                $eq: [
                                    {
                                        $field: 'id'
                                    }, {
                                        $field: `'${this.config.value}'`
                                    }
                                ]
                            },
                            datasource: this.field.datasource
                        }
                    ];
                    this.api.execute(
                        new BiRequestBuilder()
                            .method(Methods.QUERY)
                            .params(params)
                            .build())
                        .pipe(
                            first()
                        )
                        .subscribe(response => this.placeholder = response.result.result[0][0]);
                    break;
                }
                case 'tree': {
                    this.placeholder = this.treePlaceholder();
                    break;
                }
                default: {
                    console.warn(`FormDropdownComponent: type ${this.config.type} don\'t support`);
                    console.warn(this.config);
                }
            }
        }
    }

    ngOnDestroy(): void {
        this.searchSubscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.init();
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

    onClean(event: MouseEvent) {
        this.propagateChange('');
        this.open = false;
        this.placeholder = this.translate.instant('DROP_DOWN.CHOOSE') + ` ${this.field.description ? this.field.description : this.translate.instant('DROP_DOWN.VALUE')}`;
        this.select.emit();
        event.stopPropagation();
    }

    onSelect(row: any[]) {
        this.propagateChange(row[0]);
        this.open = false;
        this.placeholder = row[1];
        this.select.emit();
    }

    onTreeSelect(treeView: TreeviewComponent, downlineItems: any[]) {
        // hack, skip event on init load items
        if (downlineItems.length !== this.config.value.length) {
            traverse(treeView.items, (leaf) => {
                if (leaf.checked) {
                    if (!includes(this.config.value, leaf.value)) {
                        if (isNil(leaf.children)) {
                            this.config.value.push(leaf.value);
                        }
                    }
                } else {
                    remove(this.config.value, n => n === leaf.value);
                }
            });

            this.propagateChange(this.config.value);
            this.select.emit();
            this.placeholder = this.treePlaceholder();
        }
    }

    private init(): void {
        this.placeholder = this.translate.instant('DROP_DOWN.CHOOSE') + ` ${this.field.description ? this.field.description : this.translate.instant('DROP_DOWN.VALUE')}`;
        this.list$ = this.api.execute(
            this.makeQuery())
            .pipe(
                map(response => this.response(response)),
                tap(data => {
                    this.search = false;
                    this.notFound = data.length === 0;
                })
            );
    }

    private treePlaceholder(): string {
        return this.translate.instant('DROP_DOWN.SELECTED') + `: ${this.config.value.length} ` + this.translate.instant('DROP_DOWN.NODES');
    }

    private makeQuery(term?: string) {
        let method;
        let params;

        switch (this.config.type) {
            case 'dictionary':
                method = Methods.QUERY;
                params = dictionaryQuery(this.field, term);
                break;
            case 'string':
                method = Methods.QUERY;
                params = stringQuery(this.field, term);
                break;
            case 'tree':
                method = Methods.GET_HIERARCHY;
                params = treeQuery(this.field, term);
                break;
        }
        return new BiRequestBuilder()
            .id(2)
            .method(method)
            .params([params])
            .build();
    }

    // ToDo after delete first version of BI, refactor 'get_hierarchy' backend method!!!!
    private response(response: Result) {
        if (this.config.type === 'tree') {
            if (isEmpty(response.result)) {
                return [];
            }
            traverse([response.result], (leaf) => {
                leaf.value = leaf.id;
                leaf.checked = includes(this.config.value, leaf.id);
            });
            return [new TreeviewItem(response.result)];
        } else {
            return response.result.result;
        }
    }
}

function stringQuery(field: Field, term?: string) {
    const query = {
        fields: [
            {
                expr: 'id',
                alias: field.expr
            },
            {
                expr: 'name',
                alias: 'value',
                order: 0
            }
        ],
        datasource: field.datasource,
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

function dictionaryQuery(field: Field, term?: string) {
    const query = {
        fields: [
            {
                expr: field.name,
                group: 0
            }, {
                expr: {
                    $lookup: [
                        field.dict,
                        {
                            $field: field.name
                        }
                    ]
                },
                alias: 'value',
                order: 0
            }
        ],
        datasource: field.datasource,
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

function treeQuery(field: Field, term?: string) {
    const query = {
        datasource: field.datasource,
        field_name: field.name,
        dic_name: field.dict
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
