import React from 'react';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Layout, Row, Col, Space } from 'antd';
import LayoutBreadcrumb from './Breadcrumb';
import PersonalCenter from './PersonalCenter';
import LocalSettingsHeaderButton from './LocalSettings';
import { FullScreenHeaderButton } from './FullScreen';
import NoticeHeaderButton from './NoticeIcon';
import HeaderButton from './HeaderButton';
import LayoutMenu from './Menu';
import { useLayoutStore } from '@/store';

const { Header } = Layout;

export default function LayoutHeader() {
  const isDarkMode = useLayoutStore((state) => state.isDarkMode);
  const collapsed = useLayoutStore((state) => state.collapsed);
  const layout = useLayoutStore((state) => state.layout);
  const setCollapsed = useLayoutStore((state) => state.setCollapsed);
  return (
    <Header
      style={{
        height: 48,
        lineHeight: '48px',
        padding: '0 12px',
        backgroundColor: !isDarkMode ? '#fff' : undefined
      }}
    >
      <Row justify="space-between" align="middle">
        <Col>
          <Space>
            <HeaderButton
              icon={React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined
              )}
              onClick={() => setCollapsed(!collapsed)}
            />
            <LayoutBreadcrumb />
          </Space>
        </Col>
        {layout === 'top' ? (
          <Col span={18}>
            <LayoutMenu />
          </Col>
        ) : null}
        <Col>
          <Space>
            <FullScreenHeaderButton />
            <NoticeHeaderButton />
            <PersonalCenter />
            <LocalSettingsHeaderButton />
          </Space>
        </Col>
      </Row>
    </Header>
  );
}
