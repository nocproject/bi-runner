import { Action } from '@ngrx/store';

import { IOption } from 'app/model';

export const ADD_OPTIONS = '[Option] Add Options';
export const CLEAR_OPTIONS = '[Option] Clear Options';

export class AddOptions implements Action {
    readonly type = ADD_OPTIONS;

    constructor(public payload: IOption[]) {
    }
}

export class ClearOptions implements Action {
    readonly type = CLEAR_OPTIONS;
}

export type All =
    AddOptions
    | ClearOptions;