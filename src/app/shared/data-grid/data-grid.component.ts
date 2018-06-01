import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { flatMap, includes } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'bi-data-grid',
    templateUrl: './data-grid.component.html',
    styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {
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
    data: any[];
    cache: any[];
    // animation on change data only
    colNames: string[];
    searching: Subscription;
    searchForm: FormGroup;
    searchField: FormControl;

    constructor() {
    }

    ngOnInit(): void {
        this.searchField = new FormControl('');
        this.searchForm = new FormGroup({
            searchField: this.searchField
        });
        this.getData();
    }

    ngOnDestroy(): void {
        this.searching.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.searching = this.searchField.valueChanges
            .subscribe(term => {
                this.loading = true;
                this.data = this.localSearch(term);
                this.loading = false;
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.searchField) {
            this.getData().then(() => this.searchField.setValue(''));
        }
    }

    localSearch(term: string): any[] {
        return flatMap(this.cache)
            .filter(row => this.contains(row, term));
    }

    isSelected(row: any): boolean {
        return includes(this.selected, row.id);
    }

    onClick(id: any): void {
        if (includes(this.selected, id)) {
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

    private contains(row: any, term: string): boolean {
        return this.config.names
            .reduce((acc, colName) => acc || (row[colName].match(new RegExp(term, 'i')) !== null), false);
    }

    private getData(): Promise<any> {
        return this.config.data.toPromise()
            .then(response => {
                this.loading = true;
                this.colNames = this.config.names;
                this.cache = this.data = response;
                this.loading = false;
            });
    }
}

export class GridConfig {
    headers: string[];
    names: string[];
    height: number;
    data: Observable<any[]>;
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

    public height(height: number) {
        this.config.height = height;
        return this;
    }

    public fromJson(fromJson: (any) => any) {
        this.config.fromJson = fromJson;
        return this;
    }

    public data(data: Observable<any[]>) {
        this.config.data = data;
        return this;
    }

    public build(): GridConfig {
        return this.config;
    }
}
