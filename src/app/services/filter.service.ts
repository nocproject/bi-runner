import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

import * as _ from 'lodash';
import * as d3 from 'd3';

import { Field, Filter, FilterBuilder, Group, GroupBuilder, Value } from '../model';

import { EventService } from '../filters/services';
import { EventType, FormConfig, Groups } from '../filters/models';

@Injectable()
export class FilterService {
    ratioSubject = new BehaviorSubject<number>(1);
    isReportOpenSubject = new BehaviorSubject<boolean>(false);
    isReportOpen$: Observable<boolean> = this.isReportOpenSubject.asObservable();
    lastUpdatedWidget: string;
    private FORM_GROUP_NAME = 'form';
    // store filters name is "alias.cell_name", need for restore graphs
    private filtersSubject = new BehaviorSubject<Group[]>([]);
    filters$: Observable<Group[]> = this.filtersSubject.asObservable();
    // store state group by table
    private groupsSubject = new BehaviorSubject<Field[]>([]);
    groups$: Observable<Field[]> = this.groupsSubject.asObservable();
    // chart: initial state
    private _initChart: ChartInitState[];

    constructor(private eventService: EventService) {
    }

    initChart(cell: string): Value[] {
        const init = this._initChart.filter(item => item.name === cell);
        if (init.length > 0 && !init[0].use) {
            this._initChart.filter(item => item.name === cell)[0].use = true;
            return this._initChart.filter(item => item.name === cell)[0].values;
        }
    }

    cleanFilters() {
        this.filtersSubject.next([]);
    }

    initFilters(groups: Group[]) {
        this.nextFilter(groups);
        this.eventService.next({type: EventType.Restore, value: groups});
        this._initChart = groups
            .filter(group => group.name !== this.FORM_GROUP_NAME && group.name !== 'startEnd')
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
            exist.active = true;
        } else {
            groups.push(group);
        }

        this.nextFilter(groups);
    }

    formFilters(groups: Groups[], config: FormConfig) {
        const exist: Group[] = _.cloneDeep(this.filtersSubject.getValue())
            .filter(group => group.name !== this.FORM_GROUP_NAME);

        groups.forEach((item, groupIndex) => {
                exist.push(
                    new GroupBuilder()
                        .name(this.FORM_GROUP_NAME)
                        .active(item.active)
                        .association(item.association)
                        .filters(
                            item.group.filters
                                .filter(filter => filter.condition)
                                .filter((filter, filterIndex) => {
                                    if (filter.condition.match('empty')) {
                                        return true;
                                    }
                                    if (!filter.hasOwnProperty('valueFirst')) {
                                        return false;
                                    }
                                    // SIDE EFFECT: detect change fields name or condition, may be refactoring
                                    const nameField = _.first(config.groups[groupIndex].group.filters[filterIndex]
                                        .filter(f => f.name === 'name'));
                                    const conditionField = _.first(config.groups[groupIndex].group.filters[filterIndex]
                                        .filter(f => f.name === 'condition'));
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
                                    const [name, type, pseudo, datasource] = filter.name.split('.');

                                    return new FilterBuilder()
                                        .name(name)
                                        .type(type)
                                        .association(item.group.association)
                                        .condition(filter.condition)
                                        .pseudo(pseudo === 'true')
                                        .datasource(datasource)
                                        .values([new Value(filter.valueFirst), new Value(filter.valueSecond)])
                                        .build();
                                })
                        )
                        .build()
                );
            }
        );
        this.nextFilter(exist);
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

        return _.flatMap(groups.filter(group => group.active)
            .map(group => group.filters))
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

    private nextFilter(groups: Group[]) {
        groups.forEach(group => group.filters
            .filter(filter => !filter.isEmpty())
            .forEach(filter => {
                let values: Value[];

                if (filter.type === 'Date' && typeof filter.values[0].value === 'string') {
                    if (filter.condition.match(/interval/i)) {
                        const raw = filter.values[0].value.split(' - ');
                        values = [
                            new Value(d3.time.format('%d.%m.%Y').parse(raw[0])),
                            new Value(d3.time.format('%d.%m.%Y').parse(raw[1]))
                        ];
                    } else {
                        values = [new Value(d3.time.format('%d.%m.%Y').parse(filter.values[0].value))];
                    }
                    filter.values = values;
                }
                if (filter.type === 'DateTime' && typeof filter.values[0].value === 'string') {
                    if (!filter.condition.match(/periodic/)) {
                        if (filter.condition.match(/interval/i)) {
                            const raw = filter.values[0].value.split(' - ');
                            if (raw.length === 2) {
                                values = [
                                    new Value(d3.time.format('%d.%m.%Y %H:%M').parse(raw[0])),
                                    new Value(d3.time.format('%d.%m.%Y %H:%M').parse(raw[1]))
                                ];
                            } else {
                                values = [
                                    // relative range
                                    new Value(filter.values[0].value)
                                ];
                            }
                        } else {
                            values = [new Value(d3.time.format('%d.%m.%Y %H:%M').parse(filter.values[0].value))];
                        }
                        filter.values = values;
                    }
                }
            }));
        this.filtersSubject.next(groups);
    }
}

export interface ChartInitState {
    name: string;
    values: Value[];
    use: boolean;
}
