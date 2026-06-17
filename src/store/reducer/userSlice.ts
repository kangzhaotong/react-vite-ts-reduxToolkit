import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchLogin } from '@/services/api';
import { PURGE } from 'redux-persist';
import {
  createAppAsyncThunk,
  createAppSlice,
  createSliceSelectors
} from '@/store/reduxToolkit';

export interface UserState {
  userInfo: API.UserInfo;
  token: string | undefined;
  isLogin: boolean;
}

const initialState: UserState = {
  userInfo: {},
  token: undefined,
  isLogin: false
};

export const login = createAppAsyncThunk(
  'user/fetchLogin',
  async (params: Expand<API.LoginParams>) => {
    const response = await fetchLogin(params);
    return response;
  }
);

export const userSlice = createAppSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setUserInfo: (state, action: PayloadAction<API.UserInfo>) => {
      state.userInfo = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const { UserInfo, SessionKey } = action.payload;
        state.userInfo = UserInfo;
        state.token = SessionKey;
        state.isLogin = true;
      })
      .addCase(login.rejected, (state) => {
        state.isLogin = false;
      })
      .addCase(PURGE, (state) => {
        // 可以用这种方式更新
        state.userInfo = {};
        state.token = undefined;
        state.isLogin = false;
      });
  }
});

export const { setToken, setUserInfo } = userSlice.actions;

const { selectSlice: selectUserState, selectFromSlice: selectUser } =
  createSliceSelectors((state) => state.user);

export const selectToken = selectUser((state) => state.token);
export const selectUserInfo = selectUser((state) => state.userInfo);
export const selectIsLogin = selectUser((state) => state.isLogin);
export { selectUserState };

export default userSlice.reducer;
