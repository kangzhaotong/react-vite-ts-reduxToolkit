import React from 'react';
import ReactDOM from 'react-dom/client';

import MyApp from './App';
import { initUserInfo } from '@/hooks/useUserInfo';

import AppThemeProvider from '@/components/AppThemeProvider';
import { ConfigProvider, App } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import './App.css';

dayjs.locale('zh-cn');

initUserInfo();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <AppThemeProvider>
      <ConfigProvider locale={zhCN} input={{ autoComplete: 'off' }}>
        <App>
          <MyApp />
        </App>
      </ConfigProvider>
  </AppThemeProvider>
);
