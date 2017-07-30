import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import { GroupConfig } from '../../models/form-config.interface';
import { EventService } from '../../services/event.service';
import { EventType } from '../../models/event.interface';

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

    private subscription: Subscription;
    group: FormGroup;

    constructor(private eventService: EventService) {
    }

    ngOnInit() {
        console.log('GroupComponent: on init');
        this.group = (<FormGroup>(<FormArray>this.parent.get('groups')).at(this.index));
        this.subscription = this.group.statusChanges
            .distinctUntilChanged()
            .subscribe(status => {
                if (status === 'VALID') {
                    this.group.patchValue({active: true}, {emitEvent: false});
                } else {
                    this.group.patchValue({active: false}, {emitEvent: false});
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
    }

    onDisable(): void {
        this.group.patchValue({active: false}, {emitEvent: true, onlySelf: false});
    }
}
