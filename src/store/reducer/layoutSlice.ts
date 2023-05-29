import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

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

export const layoutSlice = createSlice({
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

export const selectCollapsed = (state: RootState) => state.layout.collapsed;

export const selectBreadcrumb = (state: RootState) => state.layout.breadcrumb;

export const selectIsDarkMode = (state: RootState) => state.layout.isDarkMode;

export const selectThemeColor = (state: RootState) => state.layout.themeColor;

export const selectLayout = (state: RootState) => state.layout.layout;

export default layoutSlice.reducer;
