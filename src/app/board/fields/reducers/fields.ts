import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import { Field } from 'app/model';
import { FieldActions, FieldActionTypes } from '../actions/field';

export interface State extends EntityState<Field> {
    selectedFieldAlias: string | null;
}

export const adapter: EntityAdapter<Field> = createEntityAdapter<Field>({
    selectId: (field: Field) => field.alias,
    sortComparer: false
});

export const initialState: State = adapter.getInitialState({
    selectedFieldAlias: null
});

export function reducer(state = initialState,
                        action: FieldActions): State {
    switch (action.type) {
        // case FieldActionTypes.Select: {
        //     return {
        //         ...state,
        //         selectedFieldAlias: action.payload
        //     };
        // }

        default: {
            return state;
        }
    }
}
