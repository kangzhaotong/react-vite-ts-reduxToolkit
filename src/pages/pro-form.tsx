import { Button, Form, Input } from 'antd';

export default () => {
  return (
    <Form
      layout="vertical"
      onFinish={async (values) => {
        console.log(values);
      }}
    >
      <Form.Item name="name" label="姓名">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
