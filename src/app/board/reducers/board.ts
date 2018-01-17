import * as board from '../actions/board';

export interface State {
    infoLoaded: boolean;
    infoLoading: boolean;
}

const initialState: State = {
    infoLoaded: false,
    infoLoading: false,
};

export function reducer(state = initialState,
                        action: board.Actions): State {
    switch (action.type) {
        case board.LOAD_DATASOURCE_INFO: {
            return {
                ...state,
                infoLoading: true
            };
        }

        case board.LOAD_DATASOURCE_INFO_SUCCESS: {
            return {
                ...state,
                infoLoaded: true,
                infoLoading: false
            };
        }

        default: {
            return state;
        }
    }
}

export const getInfoLoaded = (state: State) => state.infoLoaded;

export const getInfoLoading = (state: State) => state.infoLoading;
