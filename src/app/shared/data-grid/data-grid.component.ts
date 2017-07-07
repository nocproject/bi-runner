import {
    AfterViewInit, ChangeDetectionStrategy, Component,
    EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { QueryBuilder } from '../../model/query.builder';
import { APIService } from '../../services/api.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bi-data-grid',
    templateUrl: './data-grid.component.html',
    styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements AfterViewInit, OnInit, OnChanges {
    @Input()
    config: GridConfig;
    @Input()
    multiSelect = true;
    @Input()
    selected: any[];
    @Output()
    selectedEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    openEvent: EventEmitter<any> = new EventEmitter<any>();

    loading: boolean = false;
    results: Observable<any[]>;
    searchForm: FormGroup;
    searchField: FormControl;

    constructor(private api: APIService) {
    }

    ngOnInit(): void {
        this.searchField = new FormControl('');
        this.searchForm = new FormGroup({
            searchField: this.searchField
        });
        this.results = this.searchField.valueChanges
        // .debounceTime(400)
        // .distinctUntilChanged()
            .do(_ => this.loading = true)
            .switchMap(term => this.search(term, this.config.method, this.config.fromJson))
            .do(_ => this.loading = false);
    }

    ngAfterViewInit(): void {
        this.searchField.setValue('');
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.searchField) {
            console.log('changed');
            this.searchField.setValue('');
        }
    }

    search(term: string, method: string, fromJson): Observable<any> {
        return this.api
            .execute(new QueryBuilder()
                .method(method)
                .params([{'query': term}])
                .build())
            .map(result => result.data.map(fromJson));
    }

    isSelected(row: any): boolean {
        return _.includes(this.selected, row.id);
    }

    onClick(id: any): void {
        if (_.includes(this.selected, id)) {
            if (this.multiSelect) {
                this.selected = this.selected.filter(item => item !== id);
            } else {
                this.selected = [];
            }
        } else {
            if (this.multiSelect) {
                this.selected.push(id);
            } else {
                this.selected = [id];
                this.openEvent.emit([id]);
            }
        }
        this.selectedEvent.emit(this.selected);
    }

    onOpen(id: string): void {
        this.openEvent.emit([id]);
    }
}

export class GridConfig {
    headers: string[];
    names: string[];
    height: number;
    method: string;
    fromJson: (any) => any;

    constructor() {
        this.height = 400;
    }
}

export class GridConfigBuilder {
    private config: GridConfig = new GridConfig();

    constructor() {
        this.config.height = 400;
    }

    public headers(headers: string[]) {
        this.config.headers = headers;
        return this;
    }

    public names(names: string[]) {
        this.config.names = names;
        return this;
    }

    public method(method: string) {
        this.config.method = method;
        return this;
    }

    public height(height: number) {
        this.config.height = height;
        return this;
    }

    public fromJson(fromJson: (any) => any) {
        this.config.fromJson = fromJson;
        return this;
    }

    public build(): GridConfig {
        return this.config;
    }
}
