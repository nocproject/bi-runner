import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

import { Board, FilterBuilder, Field, GroupBuilder, Group, Value } from '../model';
import { Groups } from '../filters/models/form-data.interface';
import { FormConfig } from '../filters/models/form-config.interface';

@Injectable()
export class FilterService {
    private FORM_GROUP_NAME = 'form';
    // store filters name is "alias.cell_name", need for restore graphs
    private filtersSubject = new BehaviorSubject<Group[]>([]);
    filters$: Observable<Group[]> = this.filtersSubject.asObservable();
    // store state group by table
    private groupsSubject = new BehaviorSubject<Field[]>([]);
    groups$: Observable<Field[]> = this.groupsSubject.asObservable();

    boardSubject = new BehaviorSubject<Board>(null);
    board$: Observable<Board> = this.boardSubject.asObservable();

    qtySubject = new BehaviorSubject<number>(0);
    qty$: Observable<number> = this.qtySubject.asObservable();

    isReportOpenSubject = new BehaviorSubject<boolean>(false);
    isReportOpen$: Observable<boolean> = this.isReportOpenSubject.asObservable();

    lastUpdatedWidget: string;

    constructor() {
        console.log('created FilterService...');
    }

    cleanFilters() {
        this.filtersSubject.next([]);
    }

    filtersNext(group: Group) {
        const groups = this.cloneValue(this.filtersSubject);
        const exist: Group = _.find(groups, item => item.name === group.name);

        if (exist) {
            _.first(exist.filters).values = _.first(group.filters).values;
        } else {
            groups.push(group);
        }

        this.filtersSubject.next(groups);
    }

    formFilters(groupsConfig: Groups[], config: FormConfig) {
        const exist: Group[] = this.cloneValue(this.filtersSubject).filter(group => group.name !== this.FORM_GROUP_NAME);

        groupsConfig.forEach((item, groupIndex) => {
                exist.push(
                    new GroupBuilder()
                        .name(this.FORM_GROUP_NAME)
                        .association(item.association)
                        .filters(
                            item.group.filters
                                .filter((filter, filterIndex) => {
                                    const nameField = _.first(config.groups[groupIndex].group.filters[filterIndex]
                                        .filter(f => f.name === 'name'));

                                    if (filter.name === nameField.value) {
                                        return true;
                                    } else {
                                        nameField.value = filter.name;
                                        return false;
                                    }
                                })
                                .map(filter => {
                                    const [name, type] = filter.name.split('.');

                                    return new FilterBuilder()
                                        .name(name)
                                        .type(type)
                                        .association(item.group.association)
                                        .condition(filter.condition)
                                        .values([new Value(filter.valueFirst), new Value(filter.valueSecond)])
                                        .build();
                                })
                        )
                        .build()
                );
            }
        );
        this.filtersSubject.next(exist);
    }

    allFilters(): Group[] {
        return this.cloneValue(this.filtersSubject);
    }

    cleanGroups() {
        this.groupsSubject.next([]);
    }

    groupsNext(groups: Field[]) {
        this.groupsSubject.next(this.groupsSubject.getValue().concat(groups));
    }

    allGroups(): Field[] {
        return this.cloneValue(this.groupsSubject);
    }

    removeGroup(group: Field) {
        const groups = this.cloneValue(this.groupsSubject);

        _.remove(groups, e => e.expr === group.name);

        if (group.dict || group.name === 'ip') {
            _.remove(groups, e => e.alias === `${group.name}_text`);
        }

        this.groupsSubject.next(groups);
    }

    private cloneValue(subject: BehaviorSubject<any>) {
        return _.cloneDeep(subject.getValue());
    }
}
