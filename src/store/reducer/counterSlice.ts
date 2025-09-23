import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '@/store';

function fetchCount(amount = 1) {
  return new Promise<{ data: number }>((resolve) =>
    setTimeout(() => resolve({ data: amount }), 500)
  );
}

export interface CounterState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
  initData: { name: string, age: number }[]
}

const initialState: CounterState = {
  value: 2,
  status: 'idle',
  initData: [{ name: 'asdadadas', age: 1231 }, { name: 'asdadadas', age: 1231 }, { name: 'asdadadas', age: 1231 }, { name: 'asdadadas', age: 1231 }]
};

export const incrementAsync = createAsyncThunk(
  'counter/fetchCount',
  async (amount: number) => {
    const response = await fetchCount(amount);
    return response.data;
  }
);

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
      console.log(state, 'kztkztkztkzt')
      state.initData.push({ name: 'kzt', age: 99999 })
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(incrementAsync.pending, (state) => {
        console.log(state, 'padding')
        state.status = 'loading';
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        console.log(state, action, 'fulfilled')
        state.status = 'idle';
        state.value += action.payload;
      })
      .addCase(incrementAsync.rejected, (state) => {
        state.status = 'failed';
      });
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export const selectCount = (state: RootState) => state.counter.value;

export const incrementIfOdd =
  (amount: number): AppThunk =>
    (dispatch, getState) => {
      const currentValue = selectCount(getState());
      if (currentValue % 2 === 1) {
        dispatch(incrementByAmount(amount));
      }
    };

export default counterSlice.reducer;
