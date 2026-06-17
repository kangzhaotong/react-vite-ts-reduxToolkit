import React from 'react';
import { Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { ThemeColors } from '@/config';
import { useLayoutStore } from '@/store';

export function ThemeColorsSelect() {
  const themeColor = useLayoutStore((state) => state.themeColor);
  const setThemeColor = useLayoutStore((state) => state.setThemeColor);
  return (
    <Space>
      {ThemeColors.map((color, index) => (
        <ColorBlockItem
          key={index}
          color={color}
          isActive={themeColor === color}
          onClick={() => {
            setThemeColor(color);
          }}
        />
      ))}
    </Space>
  );
}

interface ColorBlockItemParams {
  color: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  isActive?: boolean;
}

function ColorBlockItem({ color, isActive, onClick }: ColorBlockItemParams) {
  return (
    <div
      style={{
        cursor: 'pointer',
        borderRadius: 6,
        width: 26,
        height: 26,
        textAlign: 'center',
        marginRight: 0,
        lineHeight: '24px',
        overflow: 'hidden',
        backgroundColor: color
      }}
      color={color}
      onClick={onClick}
    >
      {isActive && <ColorItemActive />}
    </div>
  );
}

function ColorItemActive() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <CheckOutlined style={{ color: '#fff', fontWeight: 'bold' }} />
    </div>
  );
}
