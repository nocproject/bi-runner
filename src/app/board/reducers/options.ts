import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import { IOption } from 'app/model';
import * as option from '../actions/options';

export interface State extends EntityState<IOption> {
}

export const adapter: EntityAdapter<IOption> = createEntityAdapter<IOption>({
        selectId: (option: IOption) => option.value
    }
);

export const initialState: State = adapter.getInitialState({});

export function reducer(state = initialState,
                        action: option.All): State {
    switch (action.type) {
        case option.ADD_OPTIONS: {
            return adapter.addMany(action.payload, state);
        }

        case option.CLEAR_OPTIONS: {
            return adapter.removeAll({...state});
        }

        default: {
            return state;
        }
    }
}