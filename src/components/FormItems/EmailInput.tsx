import { Form, Input } from 'antd';
import type { FormItemProps, InputProps } from 'antd';

export default function EmailInput({
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
          pattern:
            /^[a-zA-Z0-9]+([-_.][A-Za-zd]+)*@([a-zA-Z0-9]+[-.])+[A-Za-zd]{2,5}$/,
          message: '请输入正确的邮箱'
        },
        ...rules
      ]}
    >
      <Input placeholder="请输入邮箱" {...fieldProps} />
    </Form.Item>
  );
}
