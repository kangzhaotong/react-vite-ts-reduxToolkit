import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { Space } from 'antd';

const Footer: React.FC = () => {
  return (
    <footer
      className="site-footer"
      style={{
        padding: '16px 24px',
        textAlign: 'center'
      }}
    >
      <Space size="large" wrap>
        <a href="https://baidu.com" target="_blank" rel="noreferrer">
          Source Code
        </a>
        <a href="https://baidu.com" target="_blank" rel="noreferrer">
          <GithubOutlined />
        </a>
        <a href="https://baidu.com" target="_blank" rel="noreferrer">
          Preview
        </a>
      </Space>
    </footer>
  );
};

export default Footer;
