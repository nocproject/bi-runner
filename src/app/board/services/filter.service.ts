import { Injectable } from '@angular/core';

import { BehaviorSubject ,  Observable } from 'rxjs';

import { cloneDeep, find, findIndex, flatMap } from 'lodash';
import { timeParse } from 'd3-time-format';

import { Field, Filter, FilterBuilder, Group, GroupBuilder, Value } from '@app/model';
//
import { EventService } from './event.service';
import { EventType, FilterGroupConfig } from '../filters-form/model';

@Injectable()
export class FilterService {
    ratioSubject = new BehaviorSubject<number>(1);
    lastUpdatedWidget: string;
    private FORM_GROUP_NAME = 'form';
    // store filters name is "alias.cell_name", need for restore graphs
    private filtersSubject = new BehaviorSubject<Group[]>([]);
    filters$: Observable<Group[]> = this.filtersSubject.asObservable();
    // chart: initial state
    private _initChart: ChartInitState[];
    private _fields: Field[];

    constructor(private eventService: EventService) {
    }

    set fields(fields: Field[]) {
        this._fields = fields;
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
        this.eventService.next({type: EventType.Restore, payload: groups});
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
        const groups = cloneDeep(this.filtersSubject.getValue());
        const exist: Group = find(groups, (item: Group) => item.name === group.name);

        if (exist) {
            exist.filters = group.filters;
            exist.active = true;
        } else {
            groups.push(group);
        }

        this.nextFilter(groups);
    }

    formFilters(groups: FilterGroupConfig[]): void {
        const exist: Group[] = cloneDeep(this.filtersSubject.getValue())
            .filter(group => group.name !== this.FORM_GROUP_NAME);

        groups.forEach((item) => {
                exist.push(
                    new GroupBuilder()
                        .name(this.FORM_GROUP_NAME)
                        .active(item.active)
                        .association(item.association)
                        .filters(
                            item.group.filters
                                .map(filter => {
                                    return new FilterBuilder()
                                        .name(filter.name)
                                        .association(item.group.association)
                                        .condition(filter.condition)
                                        .field(this.fieldByName(filter.name))
                                        .values([new Value(filter.value)])
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
        const groups = cloneDeep(this.filtersSubject.getValue());

        groups.forEach(group => {
            group.filters = group.filters.filter(filter => !filter.isEmpty());
        });

        return groups.filter(group => group.filters.length > 0);
    }

    filtersByName(name: string): Filter[] {
        const groups = cloneDeep(this.filtersSubject.getValue());

        return flatMap(groups.filter(group => group.active)
            .map(group => group.filters))
            .filter(filter => filter.name === name);
    }

    getFilter(name: string): Group[] {
        return this.allFilters().filter(group => group.name === name);
    }

    removeFilter(name: string): void {
        this.filtersSubject.next(
            cloneDeep(this.allFilters().filter(group => group.name !== name))
        );
    }

    fieldByName(name: string): Field {
        const index = findIndex(this._fields, f => f.name === name);

        return index !== -1 ? this._fields[index] : undefined;
    }

    private nextFilter(groups: Group[]) {
        groups.forEach(group => group.filters
            .filter(filter => !filter.isEmpty() && filter.field)
            .forEach(filter => {
                let values: Value[];

                if (filter.getType() === 'Date' && typeof filter.values[0].value === 'string') {
                    if (filter.condition.match(/interval/i)) {
                        const raw = filter.values[0].value.split(' - ');
                        values = [
                            new Value(timeParse('%d.%m.%Y')(raw[0])),
                            new Value(timeParse('%d.%m.%Y')(raw[1]))
                        ];
                    } else {
                        values = [new Value(timeParse('%d.%m.%Y')(filter.values[0].value))];
                    }
                    filter.values = values;
                }
                if (filter.getType() === 'DateTime' && typeof filter.values[0].value === 'string') {
                    if (!filter.condition.match(/periodic/)) {
                        if (filter.condition.match(/interval/i)) {
                            const raw = filter.values[0].value.split(' - ');
                            if (raw.length === 2) {
                                values = [
                                    new Value(timeParse('%d.%m.%Y %H:%M')(raw[0])),
                                    new Value(timeParse('%d.%m.%Y %H:%M')(raw[1]))
                                ];
                            } else {
                                values = [
                                    // relative range
                                    new Value(filter.values[0].value)
                                ];
                            }
                        } else {
                            values = [new Value(timeParse('%d.%m.%Y %H:%M')(filter.values[0].value))];
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
