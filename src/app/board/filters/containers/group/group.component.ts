import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

import { EventService } from '../../services';
import { FilterService } from 'app/services';
//
import { EventType, FormConfig, GroupConfig } from '../../model';

@Component({
    selector: 'bi-group',
    templateUrl: './group.component.html'
})
export class GroupComponent implements OnInit, OnDestroy {
    @Input()
    index: number;
    @Input()
    groupConfig: GroupConfig;
    @Input()
    parent: FormGroup;
    @Input()
    formConfig: FormConfig;
    group: FormGroup;
    private subscription: Subscription;

    constructor(private eventService: EventService,
                private filterService: FilterService) {
    }

    get hasFilters(): boolean {
        return (<FormArray>this.group.get('group.filters')).length > 0;
    }

    ngOnInit() {
        this.group = (<FormGroup>(<FormArray>this.parent.get('groups')).at(this.index));
        this.subscription = this.group.statusChanges
            .distinctUntilChanged()
            .subscribe(status => {
                if (status !== 'VALID') {
                    this.group.patchValue({active: false});
                }
            });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    onGroupClose(): void {
        this.eventService.next({type: EventType.DeleteGroup, group: this.index});
    }

    onAddFilter(): void {
        this.eventService.next({type: EventType.AddFilter, group: this.index});
    }

    onApply(): void {
        this.group.patchValue({active: true});
        this.applyChanges();
    }

    onDisable(): void {
        this.group.patchValue({active: false});
        this.applyChanges();
    }

    private applyChanges() {
        const data = _.clone(this.parent.value);

        this.filterService.formFilters(data.groups, this.formConfig);
    }
}
