import { Action } from '@ngrx/store';

import { Field } from 'app/model/index';

export const ADD_FIELD = '[Field] Add Field';
export const ADD_FIELDS = '[Field] Add Fields';
export const UPDATE_FIELD = '[Field] Update Field';
export const UPDATE_FIELDS = '[Field] Update Fields';
export const DELETE_FIELD = '[Field] Delete Field';
export const DELETE_FIELDS = '[Field] Delete Fields';
export const CLEAR_FIELDS = '[Field] Clear Fields';

export class AddField implements Action {
    readonly type = ADD_FIELD;

    constructor(public payload: { field: Field }) {
    }
}

export class AddFields implements Action {
    readonly type = ADD_FIELDS;

    constructor(public payload: Field[]) {
    }
}

export class UpdateField implements Action {
    readonly type = UPDATE_FIELD;

    constructor(public payload: { field: { id: string, changes: Field } }) {
    }
}

export class UpdateFields implements Action {
    readonly type = UPDATE_FIELDS;

    constructor(public payload: { fields: { id: string, changes: Field }[] }) {
    }
}

export class DeleteField implements Action {
    readonly type = DELETE_FIELD;

    constructor(public payload: { id: string }) {
    }
}

export class DeleteFields implements Action {
    readonly type = DELETE_FIELDS;

    constructor(public payload: { ids: string[] }) {
    }
}

export class ClearFields implements Action {
    readonly type = CLEAR_FIELDS;
}

export type All =
    AddField
    | AddFields
    | UpdateField
    | UpdateFields
    | DeleteField
    | DeleteFields
    | ClearFields;