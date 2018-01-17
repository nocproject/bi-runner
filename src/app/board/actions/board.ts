import { Action } from '@ngrx/store';

export const LOAD_DATASOURCE_INFO = '[Board] Load datasource info';
export const LOAD_DATASOURCE_INFO_SUCCESS = '[Board] Load datasource info success';

export class LoadInfo implements Action {
    readonly type = LOAD_DATASOURCE_INFO;
}

export class LoadInfoSuccess implements Action {
    readonly type = LOAD_DATASOURCE_INFO_SUCCESS;
}

export type Actions =
    LoadInfo
    | LoadInfoSuccess;
