import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';

import { cloneDeep } from 'lodash';

import { FilterGroupConfig } from '../model/filters-form-config.interface';
import { EventType } from '../model/event.interface';
import { EventService } from '../../services/event.service';
import { FilterService } from '../../services/filter.service';

@Component({
    selector: 'bi-filters-group',
    templateUrl: './group.component.html'
})
export class GroupComponent implements OnInit, OnDestroy {
    @Input()
    index: number;
    @Input()
    parent: FormGroup;
    @Input()
    groupConfig: FilterGroupConfig;
    group: FormGroup;
    //
    private valuesSubscription: Subscription;

    constructor(private eventService: EventService,
                private filterService: FilterService) {
    }

    get hasFilters(): boolean {
        return (<FormArray>this.group.get('group.filters')).length > 0;
    }

    ngOnInit() {
        this.group = (<FormGroup>(<FormArray>this.parent.get('groups')).at(this.index));
        this.valuesSubscription = this.group.valueChanges.subscribe(data => {
            if (data.active) {
                this.onDisable();
            }
        });
    }

    ngOnDestroy(): void {
        this.valuesSubscription.unsubscribe();
    }

    onApply(): void {
        this.group.patchValue({active: true}, {emitEvent: false});
        this.applyChanges();
    }

    onDisable(): void {
        this.group.patchValue({active: false});
        this.applyChanges();
    }

    onDeleteGroup(): void {
        this.eventService.next({type: EventType.DeleteGroup, group: this.index});
    }

    onAddFilter(): void {
        this.eventService.next({type: EventType.AddFilter, group: this.index});
    }

    private applyChanges() {
        const data = cloneDeep(this.parent.value);

        this.filterService.formFilters(data.groups);
    }
}
