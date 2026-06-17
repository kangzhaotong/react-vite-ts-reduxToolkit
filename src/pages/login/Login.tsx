import { FC, useState, createElement, ReactNode } from 'react';
import { Button, Space, Form, theme } from 'antd';
import type { FormItemProps } from 'antd';
import { message } from '@/hooks/useGlobalTips';
import { useUserStore } from '@/store';
import styles from './login.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import {
  // AlipayCircleFilled,
  LockOutlined,
  UserOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import LoginLogo from './LoginLogo';
//redux原生和dva的区别就是dva的方法按照约定式文件是不需要手动导入的
const FormItem = Form.Item;
const { useToken } = theme;
// const iconStyles = {
//   marginInlineStart: '16px',
//   fontSize: '24px',
//   verticalAlign: 'middle',
//   cursor: 'pointer'
// };

interface Container {
  children: ReactNode;
}

const LoginContainer: FC<Container> = ({ children }) => {
  return (
    <div className={styles.login_bg}>
      <div className={styles.login_container}>{children}</div>
    </div>
  );
};

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);
  const prev_page_location = location.state as typeof location;

  const onFinish: (formData: any) => Promise<boolean | void> = async (
    values
  ) => {
    await login({ username: values.username, password: values.password });
    message.success('登录成功');
    navigate(
      prev_page_location
        ? prev_page_location.pathname + prev_page_location.search
        : '/'
    );
  };
  return (
    <LoginContainer>
      <div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <LoginLogo />
          <span className={styles.subtitle}>React模板</span>
        </div>
        <Form
          initialValues={{
            username: 'admin',
            password: '123456'
          }}
          onFinish={onFinish}
          layout="vertical"
        >
          <UserName name="username" />
          <Password name="password" />
          <FormItem style={{ marginTop: 32, marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </FormItem>
          <Actions />
        </Form>
      </div>
    </LoginContainer>
  );
}

interface LoginFormItem extends FormItemProps {
  prefix: ReactNode;
  children: ReactNode;
  suffix?: ReactNode;
}

const LoginFormItem: FC<LoginFormItem> = ({
  prefix,
  suffix,
  children,
  ...formItemProps
}) => {
  const { token } = useToken();
  return (
    <div className={styles.form_item_box}>
      {prefix}
      <FormItem {...formItemProps} className={styles.form_item}>
        {children}
      </FormItem>
      {suffix}
      <span className={styles.line}>
        <i
          style={{ borderBottomColor: token.colorPrimary }}
          className={styles.line_active}
        />
      </span>
    </div>
  );
};

function UserName(formItemProps: FormItemProps) {
  return (
    <LoginFormItem
      {...formItemProps}
      prefix={
        <UserOutlined
          className={classnames(styles.form_item_icon, styles.prefix)}
        />
      }
    >
      <input autoComplete="off" type="text" placeholder="请输入用户名" />
    </LoginFormItem>
  );
}

function Password(formItemProps: FormItemProps) {
  const [isLock, setLock] = useState(false);
  return (
    <LoginFormItem
      {...formItemProps}
      prefix={
        <LockOutlined
          className={classnames(styles.form_item_icon, styles.prefix)}
        />
      }
      suffix={createElement(isLock ? EyeOutlined : EyeInvisibleOutlined, {
        className: classnames(styles.form_item_icon, styles.suffix),
        onClick: () => setLock((preState) => !preState)
      })}
    >
      <input
        type={isLock ? 'text' : 'password'}
        placeholder="请输入密码"
        name="password"
      />
    </LoginFormItem>
  );
}

function Actions() {
  return (
    <Space style={{ marginTop: 16 }}>
      {/* 其他登录方式 */}
      {/* <AlipayCircleFilled style={{ ...iconStyles, color: '#1976ff' }} /> */}
    </Space>
  );
}
