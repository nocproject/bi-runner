import { Action } from '@ngrx/store';

export const SET_SAMPLE = '[Datasource] Set sample value';
export const SET_NAME = '[Datasource] Set name';

export class SetSample implements Action {
    readonly type = SET_SAMPLE;

    constructor(public payload: boolean) {
    }
}

export class SetName implements Action {
    readonly type = SET_NAME;

    constructor(public payload: string) {
    }
}

export type Actions = SetSample
    | SetName;
