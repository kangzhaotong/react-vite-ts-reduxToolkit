import { UserOutlined } from '@ant-design/icons';
import { Dropdown, Row, Col, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { useUserStore } from '@/store';
import {
  FormOutlined,
  PoweroffOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const enum PersonalCenterMenuKeys {
  MyInfo = 'MYINFO',
  ModifyPassword = 'MODIFYPASSWORD',
  Logout = 'LOGOUT'
}

export default function PersonalCenterEntry() {
  const navigate = useNavigate();
  const items: MenuProps['items'] = [
    {
      key: PersonalCenterMenuKeys.MyInfo,
      label: '我的信息',
      icon: <IdcardOutlined />
    },
    {
      key: PersonalCenterMenuKeys.ModifyPassword,
      label: '修改密码',
      icon: <FormOutlined />
    },
    { type: 'divider' },
    {
      key: PersonalCenterMenuKeys.Logout,
      danger: true,
      label: '退出登录',
        icon: <PoweroffOutlined />
    }
  ];
  const userInfo = useUserStore((state) => state.userInfo);
  const resetUser = useUserStore((state) => state.reset);
  return (
    <Dropdown
      trigger={['hover']}
      menu={{
        items,
        style: { width: 110 },
        onClick: (e) => {
          switch (e.key) {
            case PersonalCenterMenuKeys.MyInfo:
              navigate('/my-info');
              break;
            case PersonalCenterMenuKeys.ModifyPassword:
              navigate('/change-password');
              break;
            case PersonalCenterMenuKeys.Logout:
              resetUser();
              break;
          }
        }
      }}
    >
      <Row
        gutter={10}
        style={{
          cursor: 'pointer',
          marginTop: -2,
          userSelect: 'none',
          padding: '0 10px'
        }}
      >
        <Col>
          <Avatar size="default" icon={<UserOutlined />} />
        </Col>
        <Col>{userInfo.Name || 'Admin'}</Col>
      </Row>
    </Dropdown>
  );
}
