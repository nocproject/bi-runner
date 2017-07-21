import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

import * as _ from 'lodash';

import { Board, Field, Filter, FilterBuilder, Group, GroupBuilder, Value } from '../model';

import { EventService } from '../filters/services/event.service';
import { Groups } from '../filters/models/form-data.interface';
import { FormConfig } from '../filters/models/form-config.interface';
import { EventType } from '../filters/models/event.interface';

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
    // chart: initial state
    private _initChart: ChartInitState[];

    initChart(cell: string): Value[] {
        const init = this._initChart.filter(item => item.name === cell);
        if (init.length > 0 && !init[0].use) {
            this._initChart.filter(item => item.name === cell)[0].use = true;
            return this._initChart.filter(item => item.name === cell)[0].values;
        }
    }

    constructor(private eventService: EventService) {
        console.log('created FilterService...');
    }

    cleanFilters() {
        this.filtersSubject.next([]);
    }

    initFilters(groups: Group[]) {
        this.filtersSubject.next(groups);
        this.eventService.next({type: EventType.Restore, value: groups});
        this._initChart = groups
            .filter(group => group.name !== 'form' && group.name !== 'startEnd')
            .map(group => {
                return {
                    name: group.name.split('.')[1],
                    values: group.filters[0].values,
                    use: false
                };
            });
    }

    filtersNext(group: Group) {
        const groups = _.cloneDeep(this.filtersSubject.getValue());
        const exist: Group = _.find(groups, item => item.name === group.name);

        if (exist) {
            _.first(exist.filters).values = _.first(group.filters).values;
        } else {
            groups.push(group);
        }

        this.filtersSubject.next(groups);
    }

    formFilters(groups: Groups[], config: FormConfig) {
        const exist: Group[] = _.cloneDeep(this.filtersSubject.getValue())
            .filter(group => group.name !== this.FORM_GROUP_NAME);

        groups.forEach((item, groupIndex) => {
                exist.push(
                    new GroupBuilder()
                        .name(this.FORM_GROUP_NAME)
                        .association(item.association)
                        .filters(
                            item.group.filters
                                .filter((filter, filterIndex) => {
                                    const nameField = _.first(config.groups[groupIndex].group.filters[filterIndex]
                                        .filter(f => f.name === 'name'));
                                    const conditionField = _.first(config.groups[groupIndex].group.filters[filterIndex]
                                        .filter(f => f.name === 'condition'));
                                    const valueField = _.first(config.groups[groupIndex].group.filters[filterIndex]
                                        .filter(f => f.name === 'valueFirst'));

                                    if (!filter.hasOwnProperty('valueFirst')) {
                                        return false;
                                    }
                                    filter.pseudo = conditionField.pseudo;
                                    filter.datasource = valueField.datasource;
                                    // detect change fields name or condition
                                    if (filter.condition === conditionField.value && filter.name === nameField.value) {
                                        return true;
                                    } else if (filter.condition !== conditionField.value) {
                                        conditionField.value = filter.condition;
                                        return false;
                                    } else if (filter.name !== nameField.value) {
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
                                        .pseudo(filter.pseudo)
                                        .datasource(filter.datasource)
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
        const groups = _.cloneDeep(this.filtersSubject.getValue());

        groups.forEach(group => {
            group.filters = group.filters.filter(filter => !filter.isEmpty());
        });

        return groups.filter(group => group.filters.length > 0);
    }

    allFiltersByName(name: string): Filter[] {
        const groups = _.cloneDeep(this.filtersSubject.getValue());

        return _.flatMap(groups.map(group => group.filters))
            .filter(filter => filter.name === name);
    }

    getFilter(name: string): Group[] {
        return this.allFilters().filter(group => group.name === name);
    }

    cleanGroups() {
        this.groupsSubject.next([]);
    }

    groupsNext(groups: Field[]) {
        this.groupsSubject.next(this.groupsSubject.getValue().concat(groups));
    }

    allGroups(): Field[] {
        return _.cloneDeep(this.groupsSubject.getValue());
    }

    removeGroup(group: Field) {
        const groups = _.cloneDeep(this.groupsSubject.getValue());

        _.remove(groups, e => e.expr === group.name);

        if (group.dict || group.name === 'ip') {
            _.remove(groups, e => e.alias === `${group.name}_text`);
        }

        this.groupsSubject.next(groups);
    }
}

export interface ChartInitState {
    name: string;
    values: Value[];
    use: boolean;
}