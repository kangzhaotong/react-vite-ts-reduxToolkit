import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { getLayoutState, useAppStore } from '@/store';
import AppThemeProvider from './AppThemeProvider';

describe('AppThemeProvider', () => {
  beforeEach(() => {
    const layout = useAppStore.getState().layout;
    useAppStore.setState({
      layout: {
        ...layout,
        isDarkMode: false,
        themeColor: '#1677ff'
      }
    });
  });

  it('renders children and synchronizes dark mode with the body class', () => {
    render(
      <AppThemeProvider>
        <div>application content</div>
      </AppThemeProvider>
    );

    expect(screen.getByText('application content')).toBeInTheDocument();
    expect(document.body).not.toHaveClass('dark');

    act(() => getLayoutState().setDarkMode(true));
    expect(document.body).toHaveClass('dark');

    act(() => getLayoutState().setDarkMode(false));
    expect(document.body).not.toHaveClass('dark');
  });
});
