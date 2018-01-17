import * as datasource from '../actions/datasource';

export interface State {
    isSample: boolean;
    name: string;
}

const initialState: State = {
    isSample: false,
    name: null
};

export function reducer(state = initialState,
                        action: datasource.Actions): State {
    switch (action.type) {
        case datasource.SET_SAMPLE: {
            return {
                ...state,
                isSample: action.payload
            }
        }

        case datasource.SET_NAME: {
            return {
                ...state,
                name: action.payload
            }
        }

        default: {
            return state;
        }
    }
}

export const getSample = (state: State) => state.isSample;
export const getName = (state: State) => state.name;
