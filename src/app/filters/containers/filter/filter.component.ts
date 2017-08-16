import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import * as _ from 'lodash';

import { FieldConfig } from '../../models/form-config.interface';
import { EventType } from '../../models/event.interface';
import { EventService } from '../../services/event.service';

@Component({
    selector: 'bi-filter',
    templateUrl: './filter.component.html'
})
export class FilterComponent implements OnInit {
    @Input()
    index: number;
    @Input()
    group: number;
    @Input()
    parent: FormGroup;
    @Input()
    filterConfig: FieldConfig[];

    filter: FormGroup;
    fieldFieldName = 'name';
    conditionFieldName = 'condition';
    fieldConfig: FieldConfig;
    conditionConfig: FieldConfig;
    valueFirstConfig: FieldConfig;
    valueSecondConfig: FieldConfig;

    constructor(private eventService: EventService) {
    }

    ngOnInit() {
        this.filter = (<FormGroup>(<FormArray>this.parent.get('group.filters')).at(this.index));
        this.fieldConfig = _.find(this.filterConfig, ['name', this.fieldFieldName]);
        this.conditionConfig = _.find(this.filterConfig, ['name', this.conditionFieldName]);
        this.valueFirstConfig = _.find(this.filterConfig, ['name', 'valueFirst']);
        this.valueSecondConfig = _.find(this.filterConfig, ['name', 'valueSecond']);
    }

    onFilterClose(): void {
        this.eventService.next({type: EventType.DeleteFilter, group: this.group, filter: this.index});
    }

    onChange(value, name): void {
        this.eventService.next({
            type: EventType.ChangeSelect,
            group: this.group,
            filter: this.index,
            name: name,
            value: value
        });
    }
}
