import { Form, Input } from 'antd';
import type { FormItemProps, InputProps } from 'antd';

export default function PhoneNumber({
  rules = [],
  fieldProps,
  ...formItemProps
}: FormItemProps & {
  fieldProps?: InputProps;
}) {
  return (
    <Form.Item
      {...formItemProps}
      rules={[
        {
          required: true,
          message: '请输入手机号码'
        },
        {
          pattern: /^1(3|4|5|6|7|8|9)\d{9}/g,
          message: '请输入正确的手机号'
        },
        ...rules
      ]}
    >
      <Input
        maxLength={13}
        placeholder="请输入手机号码"
        {...fieldProps}
      />
    </Form.Item>
  );
}
