import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { GroupConfig } from '../../models/form-config.interface';
import { EventService } from '../../services/event.service';
import { EventType } from '../../models/event.interface';

@Component({
    selector: 'bi-group',
    styleUrls: ['./group.component.scss'],
    templateUrl: './group.component.html'
})
export class GroupComponent implements OnInit {
    @Input()
    index: number;
    @Input()
    groupConfig: GroupConfig;
    @Input()
    parent: FormGroup;

    group: FormGroup;

    constructor(private eventService: EventService) {
    }

    ngOnInit() {
        console.log('GroupComponent: on init');
        this.group = (<FormGroup>(<FormArray>this.parent.get('groups')).at(this.index));
    }

    onGroupClose(): void {
        this.eventService.next({type: EventType.DeleteGroup, group: this.index});
    }

    onAddFilter(): void {
        this.eventService.next({type: EventType.AddFilter, group: this.index});
    }
}
