import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromFields from '../fields/reducers/fields';
import * as fromRoot from '../../reducers';

export interface BoardState {
    fields: fromFields.State;
}

export interface State extends fromRoot.State {
    fields: fromFields.State;
}

export const reducers = {
    fields: fromFields.reducer,
};

export const getBoardState = createFeatureSelector<BoardState>('board');

export const getFieldsEntitiesState = createSelector(
    getBoardState,
    state => state.fields
);

export const {
    selectIds: getBookIds,
    selectEntities: getBookEntities,
    selectAll: getAllBooks,
    selectTotal: getTotalBooks,
} = fromFields.adapter.getSelectors(getFieldsEntitiesState);