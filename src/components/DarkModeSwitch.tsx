/*
 * @Author: M78.Kangzhaotong
 * @Date: 2023-05-22 13:33:27
 * @Last Modified by: M78.Kangzhaotong
 * @Last Modified time: 2023-05-29 15:32:00
 */
import React, { useEffect } from 'react';
import { Switch, ConfigProvider, theme } from 'antd';
import { selectIsDarkMode, setDarkMode } from '@/store/reducer/layoutSlice';
const { darkAlgorithm } = theme;

export function DarkModeSwitch() {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(selectIsDarkMode);
  return (
    <Switch
      // style={{ verticalAlign: 'unset' }}
      checked={isDarkMode}
      checkedChildren="🌜"
      unCheckedChildren="🌞"
      onChange={(checked) => dispatch(setDarkMode(checked))}
    />
  );
}

export function DarkModeConfigProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const isDarkMode = useAppSelector(selectIsDarkMode);
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark' : '';
  }, [isDarkMode]);
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? [darkAlgorithm] : undefined
      }}
    >
      {children}
    </ConfigProvider>
  );
}
