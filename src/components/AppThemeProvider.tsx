import React, { useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import { useLayoutStore } from '@/store';

const { darkAlgorithm } = theme;

export default function AppThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const isDarkMode = useLayoutStore((state) => state.isDarkMode);
  const themeColor = useLayoutStore((state) => state.themeColor);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark' : '';
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? [darkAlgorithm] : undefined,
        token: {
          colorPrimary: themeColor
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}
