import type { PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice, createSliceSelectors } from '@/store/reduxToolkit';

export interface loadingState {
  loading: boolean;
}

const initialState: loadingState = {
  loading: false
};

export const loadingSlice = createAppSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  }
});

export const { setLoading } = loadingSlice.actions;

const { selectSlice: selectLoadingState, selectFromSlice: selectLoadingValue } =
  createSliceSelectors((state) => state.loading);

export const selectLoading = selectLoadingValue((state) => state.loading);
export { selectLoadingState };

export default loadingSlice.reducer;
