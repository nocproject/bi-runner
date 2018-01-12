import { Action } from '@ngrx/store';

import { Field } from 'app/model';

// export enum FieldActionTypes {
//     Toggle = '[Field] Toggle',
//     Select = '[Field] Select',
// }
//

export enum FieldActionTypes {
    LOAD_FIELDS = '[Field] Load Fields',
    ADD_FIELD = '[Field] Add Field',
    ADD_FIELDS = '[Field] Add Fields',
    UPDATE_FIELD = '[Field] Update Field',
    UPDATE_FIELDS = '[Field] Update Fields',
    DELETE_FIELD = '[Field] Delete Field',
    DELETE_FIELDS = '[Field] Delete Fields',
    CLEAR_FIELDS = '[Field] Clear Fields'
}

export class LoadFields implements Action {
    readonly type = FieldActionTypes.LOAD_FIELDS;

    constructor(public payload: { users: Field[] }) {}
}

// export class Toggle implements Action {
//     readonly type = FieldActionTypes.Toggle;
//
//     constructor(public payload: string) {
//     }
// }
//
// export class Select implements Action {
//     readonly type = FieldActionTypes.Select;
//
//     constructor(public payload: string) {
//     }
// }

// export type FieldActions = Toggle | Select;

export type FieldActions =
    LoadFields;
    // | AddField
    // | AddFields
    // | UpdateField
    // | UpdateFields
    // | DeleteField
    // | DeleteFields
    // | ClearFields;