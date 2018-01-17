import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import { Field } from 'app/model/index';
import * as field from '../actions/fields';

export interface State extends EntityState<Field> {
}

export const adapter: EntityAdapter<Field> = createEntityAdapter<Field>({
        selectId: (field: Field) => field.name
    }
);

export const initialState: State = adapter.getInitialState({});

export function reducer(state = initialState,
                        action: field.All): State {
    switch (action.type) {
        case field.ADD_FIELD: {
            return adapter.addOne(action.payload.field, state);
        }

        case field.ADD_FIELDS: {
            return adapter.addMany(action.payload, state);
        }

        case field.UPDATE_FIELD: {
            return adapter.updateOne(action.payload.field, state);
        }

        case field.UPDATE_FIELDS: {
            return adapter.updateMany(action.payload.fields, state);
        }

        case field.DELETE_FIELD: {
            return adapter.removeOne(action.payload.id, state);
        }

        case field.DELETE_FIELDS: {
            return adapter.removeMany(action.payload.ids, state);
        }

        case field.CLEAR_FIELDS: {
            return adapter.removeAll({...state});
        }

        default: {
            return state;
        }
    }
}