import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { fetchLogin } from '@/services/api';

export type BreadcrumbItem = string | { name: string; path: string };
export type Breadcrumb = Array<BreadcrumbItem>;
export type LayoutMode = 'side' | 'top';

export interface LayoutStore {
  collapsed: boolean;
  layout: LayoutMode;
  breadcrumb: Breadcrumb;
  isDarkMode: boolean;
  themeColor: string;
  setBreadcrumb: (breadcrumb: Breadcrumb) => void;
  setCollapsed: (collapsed: boolean) => void;
  setLayout: (layout: LayoutMode) => void;
  setDarkMode: (isDarkMode: boolean) => void;
  setThemeColor: (themeColor: string) => void;
}

export interface UserStore {
  userInfo: API.UserInfo;
  token: string | undefined;
  isLogin: boolean;
  setToken: (token: string | undefined) => void;
  setUserInfo: (userInfo: API.UserInfo) => void;
  reset: () => void;
  login: (params: Expand<API.LoginParams>) => Promise<{
    UserInfo: API.UserInfo;
    SessionKey: string;
  }>;
}

export interface CounterStore {
  value: number;
  status: 'idle' | 'loading' | 'failed';
  initData: { name: string; age: number }[];
  increment: () => void;
  decrement: () => void;
  incrementByAmount: (amount: number) => void;
  incrementAsync: (amount: number) => Promise<number>;
  incrementIfOdd: (amount: number) => void;
}

export interface LoadingStore {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export interface AppStore {
  layout: LayoutStore;
  user: UserStore;
  counter: CounterStore;
  loading: LoadingStore;
}

type AppStateCreator<T> = StateCreator<
  AppStore,
  [['zustand/persist', unknown]],
  [],
  T
>;

const initialLayoutState = {
  collapsed: false,
  breadcrumb: ['首页'] as Breadcrumb,
  layout: 'side' as LayoutMode,
  isDarkMode: false,
  themeColor: '#1677ff'
};

const initialUserState = {
  userInfo: {} as API.UserInfo,
  token: undefined as string | undefined,
  isLogin: false
};

const initialCounterState = {
  value: 2,
  status: 'idle' as const,
  initData: [
    { name: 'asdadadas', age: 1231 },
    { name: 'asdadadas', age: 1231 },
    { name: 'asdadadas', age: 1231 },
    { name: 'asdadadas', age: 1231 }
  ]
};

const initialLoadingState = {
  loading: false
};

function fetchCount(amount = 1) {
  return new Promise<{ data: number }>((resolve) =>
    setTimeout(() => resolve({ data: amount }), 500)
  );
}

const createLayoutSlice: AppStateCreator<{ layout: LayoutStore }> = (set) => ({
  layout: {
    ...initialLayoutState,
    setBreadcrumb: (breadcrumb) =>
      set((state) => ({
        layout: {
          ...state.layout,
          breadcrumb
        }
      })),
    setCollapsed: (collapsed) =>
      set((state) => ({
        layout: {
          ...state.layout,
          collapsed
        }
      })),
    setLayout: (layout) =>
      set((state) => ({
        layout: {
          ...state.layout,
          layout
        }
      })),
    setDarkMode: (isDarkMode) =>
      set((state) => ({
        layout: {
          ...state.layout,
          isDarkMode
        }
      })),
    setThemeColor: (themeColor) =>
      set((state) => ({
        layout: {
          ...state.layout,
          themeColor
        }
      }))
  }
});

const createUserSlice: AppStateCreator<{ user: UserStore }> = (set) => ({
  user: {
    ...initialUserState,
    setToken: (token) =>
      set((state) => ({
        user: {
          ...state.user,
          token
        }
      })),
    setUserInfo: (userInfo) =>
      set((state) => ({
        user: {
          ...state.user,
          userInfo
        }
      })),
    reset: () =>
      set((state) => ({
        user: {
          ...state.user,
          ...initialUserState
        }
      })),
    login: async (params) => {
      const response = await fetchLogin(params);
      set((state) => ({
        user: {
          ...state.user,
          userInfo: response.UserInfo,
          token: response.SessionKey,
          isLogin: true
        }
      }));
      return response;
    }
  }
});

const createCounterSlice: AppStateCreator<{ counter: CounterStore }> = (
  set,
  get
) => ({
  counter: {
    ...initialCounterState,
    increment: () =>
      set((state) => ({
        counter: {
          ...state.counter,
          value: state.counter.value + 1,
          initData: [...state.counter.initData, { name: 'kzt', age: 99999 }]
        }
      })),
    decrement: () =>
      set((state) => ({
        counter: {
          ...state.counter,
          value: state.counter.value - 1
        }
      })),
    incrementByAmount: (amount) =>
      set((state) => ({
        counter: {
          ...state.counter,
          value: state.counter.value + amount
        }
      })),
    incrementAsync: async (amount) => {
      set((state) => ({
        counter: {
          ...state.counter,
          status: 'loading'
        }
      }));

      try {
        const response = await fetchCount(amount);
        set((state) => ({
          counter: {
            ...state.counter,
            status: 'idle',
            value: state.counter.value + response.data
          }
        }));
        return response.data;
      } catch (error) {
        set((state) => ({
          counter: {
            ...state.counter,
            status: 'failed'
          }
        }));
        throw error;
      }
    },
    incrementIfOdd: (amount) => {
      const currentValue = get().counter.value;
      if (currentValue % 2 === 1) {
        get().counter.incrementByAmount(amount);
      }
    }
  }
});

const createLoadingSlice: AppStateCreator<{ loading: LoadingStore }> = (set) => ({
  loading: {
    ...initialLoadingState,
    setLoading: (loading) =>
      set((state) => ({
        loading: {
          ...state.loading,
          loading
        }
      }))
  }
});

export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createLayoutSlice(...args),
      ...createUserSlice(...args),
      ...createCounterSlice(...args),
      ...createLoadingSlice(...args)
    }),
    {
      name: 'fine-admin-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        layout: {
          collapsed: state.layout.collapsed,
          breadcrumb: state.layout.breadcrumb,
          layout: state.layout.layout,
          isDarkMode: state.layout.isDarkMode,
          themeColor: state.layout.themeColor
        },
        user: {
          userInfo: state.user.userInfo,
          token: state.user.token,
          isLogin: state.user.isLogin
        },
        counter: {
          value: state.counter.value,
          status: state.counter.status,
          initData: state.counter.initData
        }
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppStore>;

        return {
          ...currentState,
          layout: {
            ...currentState.layout,
            ...persisted.layout
          },
          user: {
            ...currentState.user,
            ...persisted.user
          },
          counter: {
            ...currentState.counter,
            ...persisted.counter
          },
          loading: {
            ...currentState.loading,
            ...persisted.loading
          }
        };
      }
    }
  )
);

export const appStore = useAppStore;

export const getLayoutState = () => appStore.getState().layout;
export const getUserState = () => appStore.getState().user;
export const getCounterState = () => appStore.getState().counter;
export const getLoadingState = () => appStore.getState().loading;

export const getUserToken = () => getUserState().token;
export const setUserInfo = (userInfo: API.UserInfo) =>
  getUserState().setUserInfo(userInfo);

export const useLayoutStore = <Selected>(
  selector: (state: LayoutStore) => Selected
) => useAppStore((state) => selector(state.layout));

export const useUserStore = <Selected>(
  selector: (state: UserStore) => Selected
) => useAppStore((state) => selector(state.user));

export const useCounterStore = <Selected>(
  selector: (state: CounterStore) => Selected
) => useAppStore((state) => selector(state.counter));

export const useLoadingStore = <Selected>(
  selector: (state: LoadingStore) => Selected
) => useAppStore((state) => selector(state.loading));

export const resetUser = () => getUserState().reset();
