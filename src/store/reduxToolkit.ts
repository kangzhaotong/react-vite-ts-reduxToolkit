import {
  createAsyncThunk,
  createSlice,
  type AsyncThunkOptions,
  type AsyncThunkPayloadCreator,
  type CreateSliceOptions,
  type Reducer,
  type SliceCaseReducers
} from '@reduxjs/toolkit';
import { persistReducer, type PersistConfig } from 'redux-persist';
import type { AppDispatch, RootState } from './index';

type AppThunkConfig = {
  dispatch: AppDispatch;
  state: RootState;
  rejectValue: string;
};

export function createAppSlice<
  State,
  CaseReducers extends SliceCaseReducers<State>,
  Name extends string = string
>(options: CreateSliceOptions<State, CaseReducers, Name>) {
  return createSlice(options);
}

export function createAppAsyncThunk<Returned, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<
    Returned,
    ThunkArg,
    AppThunkConfig
  >,
  options?: AsyncThunkOptions<ThunkArg, AppThunkConfig>
) {
  return createAsyncThunk<Returned, ThunkArg, AppThunkConfig>(
    typePrefix,
    payloadCreator,
    options
  );
}

export function createSliceSelectors<SliceState>(
  selectSlice: (state: RootState) => SliceState
) {
  const selectFromSlice =
    <Selected>(selector: (sliceState: SliceState) => Selected) =>
    (state: RootState) =>
      selector(selectSlice(state));

  return {
    selectSlice,
    selectFromSlice
  };
}

export function createPersistedReducer<State>(
  config: PersistConfig<State>,
  reducer: Reducer<State>
) {
  return persistReducer(config, reducer);
}
