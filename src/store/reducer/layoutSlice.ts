import type { PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice, createSliceSelectors } from '@/store/reduxToolkit';

type BreadcrumbItem = string | { name: string; path: string };

type Breadcrumb = Array<BreadcrumbItem>;

export interface LayoutState {
  collapsed: boolean;
  layout: string;
  breadcrumb: Breadcrumb;
  isDarkMode: boolean;
  themeColor: string;
}

const initialState: LayoutState = {
  collapsed: false,
  breadcrumb: ['首页'],
  layout: "side", // 导航模式 side,mix top
  isDarkMode: false,
  themeColor: '#1677ff'
};

export const layoutSlice = createAppSlice({
  name: 'layout',
  initialState,
  reducers: {
    setBreadcrumb: (state, action: PayloadAction<Breadcrumb>) => {
      state.breadcrumb = action.payload;
    },
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsed = action.payload;
    },
    setLayout: (state, action: PayloadAction<string>) => {
      state.layout = action.payload
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setThemeColor: (state, action: PayloadAction<string>) => {
      state.themeColor = action.payload;
    }
  }
});

export const { setBreadcrumb, setCollapsed, setDarkMode, setThemeColor, setLayout } =
  layoutSlice.actions;

const { selectSlice: selectLayoutState, selectFromSlice: selectLayoutValue } =
  createSliceSelectors((state) => state.layout);

export const selectCollapsed = selectLayoutValue((state) => state.collapsed);
export const selectBreadcrumb = selectLayoutValue((state) => state.breadcrumb);
export const selectIsDarkMode = selectLayoutValue((state) => state.isDarkMode);
export const selectThemeColor = selectLayoutValue((state) => state.themeColor);
export const selectLayout = selectLayoutValue((state) => state.layout);
export { selectLayoutState };

export default layoutSlice.reducer;
