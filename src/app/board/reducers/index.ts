import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRoot from '../../reducers';
import * as fromField from './fields';
import * as fromBoard from './board';
import * as fromDatasource from './datasource';
import * as fromOption from './options';

export interface BoardState {
    layout: fromBoard.State;
    datasource: fromDatasource.State;
    fields: fromField.State;
    options: fromOption.State;
}

export interface State extends fromRoot.State {
    'board': BoardState;
}

export const reducers: ActionReducerMap<BoardState> = {
    layout: fromBoard.reducer,
    datasource: fromDatasource.reducer,
    fields: fromField.reducer,
    options: fromOption.reducer
};

export const getBoardState = createFeatureSelector<BoardState>('board');

export const getFieldEntitiesState = createSelector(
    getBoardState,
    state => state.fields
);

export const getOptionEntitiesState = createSelector(
    getBoardState,
    state => state.options
);

export const {
    selectIds: selectFieldIds,
    selectEntities: selectFieldEntities,
    selectAll: selectAllFields,
    selectTotal: selectFieldTotal
} = fromField.adapter.getSelectors(getFieldEntitiesState);

export const {
    selectAll: selectAllOptions
} = fromOption.adapter.getSelectors(getOptionEntitiesState);

export const getLayoutState = createSelector(
    getBoardState,
    (state: BoardState) => state.layout
);

export const getDatasourceState = createSelector(
    getBoardState,
    (state: BoardState) => state.datasource
);

export const getInfoLoaded = createSelector(
    getLayoutState,
    fromBoard.getInfoLoaded
);
export const getInfoLoading = createSelector(
    getLayoutState,
    fromBoard.getInfoLoading
);

export const getSample = createSelector(
    getDatasourceState,
    fromDatasource.getSample
);