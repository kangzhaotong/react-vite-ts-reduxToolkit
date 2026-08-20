import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/api', () => ({
  fetchLogin: vi.fn()
}));

import { fetchLogin } from '@/services/api';
import {
  getCounterState,
  getLayoutState,
  getLoadingState,
  getUserState,
  getUserToken,
  resetUser,
  setUserInfo,
  useAppStore
} from './index';

const initialCounterData = [
  { name: 'asdadadas', age: 1231 },
  { name: 'asdadadas', age: 1231 },
  { name: 'asdadadas', age: 1231 },
  { name: 'asdadadas', age: 1231 }
];

function resetStore() {
  const state = useAppStore.getState();
  useAppStore.setState({
    layout: {
      ...state.layout,
      collapsed: false,
      breadcrumb: ['首页'],
      layout: 'side',
      isDarkMode: false,
      themeColor: '#1677ff'
    },
    user: {
      ...state.user,
      userInfo: {} as API.UserInfo,
      token: undefined,
      isLogin: false
    },
    counter: {
      ...state.counter,
      value: 2,
      status: 'idle',
      initData: initialCounterData.map((item) => ({ ...item }))
    },
    loading: {
      ...state.loading,
      loading: false
    }
  });
}

describe('app store', () => {
  beforeEach(() => {
    resetStore();
    vi.mocked(fetchLogin).mockReset();
  });

  it('updates layout and loading slices', () => {
    const layout = getLayoutState();
    layout.setCollapsed(true);
    layout.setLayout('top');
    layout.setDarkMode(true);
    layout.setThemeColor('#00b96b');
    layout.setBreadcrumb(['首页', { name: '详情', path: '/detail' }]);
    getLoadingState().setLoading(true);

    expect(getLayoutState()).toMatchObject({
      collapsed: true,
      layout: 'top',
      isDarkMode: true,
      themeColor: '#00b96b',
      breadcrumb: ['首页', { name: '详情', path: '/detail' }]
    });
    expect(getLoadingState().loading).toBe(true);
  });

  it('runs counter actions, including conditional and async increments', async () => {
    vi.useFakeTimers();
    const counter = getCounterState();

    counter.increment();
    expect(getCounterState().value).toBe(3);
    expect(getCounterState().initData).toHaveLength(5);

    getCounterState().incrementIfOdd(4);
    expect(getCounterState().value).toBe(7);
    getCounterState().decrement();
    getCounterState().incrementIfOdd(4);
    expect(getCounterState().value).toBe(6);

    const pending = getCounterState().incrementAsync(5);
    expect(getCounterState().status).toBe('loading');
    await vi.advanceTimersByTimeAsync(500);

    await expect(pending).resolves.toBe(5);
    expect(getCounterState()).toMatchObject({ value: 11, status: 'idle' });
    vi.useRealTimers();
  });

  it('stores login data and resets the user session', async () => {
    const response = {
      UserInfo: { Name: 'Test User' } as API.UserInfo,
      SessionKey: 'session-token'
    };
    vi.mocked(fetchLogin).mockResolvedValue(response);

    await getUserState().login({ username: 'admin', password: '123456' });

    expect(fetchLogin).toHaveBeenCalledWith({
      username: 'admin',
      password: '123456'
    });
    expect(getUserState()).toMatchObject({
      userInfo: response.UserInfo,
      token: 'session-token',
      isLogin: true
    });
    expect(getUserToken()).toBe('session-token');

    setUserInfo({ Name: 'Updated User' } as API.UserInfo);
    expect(getUserState().userInfo.Name).toBe('Updated User');
    resetUser();
    expect(getUserState()).toMatchObject({
      userInfo: {},
      token: undefined,
      isLogin: false
    });
  });
});
