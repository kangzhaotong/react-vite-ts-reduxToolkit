import { useState } from 'react';
import { Tooltip, Drawer, Row, Col, Divider, Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { DrawerProps, ButtonProps } from 'antd';
import { DarkModeSwitch } from './DarkModeSwitch';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppHooks';
import { setLayout } from '@/store/reducer/layoutSlice';
import { ThemeColorsSelect } from './ThemeColors';
import HeaderButton from './HeaderButton';

export default function LocalSettingsHeaderButton() {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <LocalSettingsBtn onClick={() => setOpen(true)} />
      <LocalSettingsDrawer open={isOpen} onClose={() => setOpen(false)} />
    </>
  );
}

function LocalSettingsBtn({ onClick }: ButtonProps) {
  return (
    <Tooltip placement="bottomRight" title="本地设置" arrow>
      <HeaderButton icon={<SettingOutlined />} onClick={onClick} />
    </Tooltip>
  );
}
function LocalSettingsDrawer(props: DrawerProps) {
  const dispatch = useAppDispatch();
  const { layout } = useAppSelector((state) => state.layout);

  const onChange = (e: RadioChangeEvent) => {
    dispatch(setLayout(e.target.value || 'side'));
  };

  return (
    <Drawer title="系统本地设置" placement="right" {...props}>
      <Row align="top" justify="center">
        <Col span={24}>
          <Divider>整体风格</Divider>
        </Col>
        <Col>
          <DarkModeSwitch />
        </Col>
        <Col span={24}>
          <Divider>导航模式</Divider>
        </Col>
        <Col span={24}>
          <Divider>
            <Radio.Group onChange={onChange} value={layout}>
              <Radio value="side">侧边导航</Radio>
              <Radio value="top">头部导航</Radio>
            </Radio.Group>
          </Divider>
        </Col>
        <Col>
          <Divider>主题色</Divider>
        </Col>
        <Col>
          <ThemeColorsSelect />
        </Col>
      </Row>
    </Drawer>
  );
}
