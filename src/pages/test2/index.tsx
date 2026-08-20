import { useState } from 'react';
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Tag, Typography } from 'antd';

const { Paragraph, Text, Title } = Typography;

export default function Test2() {
  const [value, setValue] = useState('');
  const [submittedValue, setSubmittedValue] = useState('');

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div>
            <Tag color="blue">TEST 2</Tag>
            <Title level={2} style={{ margin: '12px 0 6px' }}>
              第二测试页
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              用于和现有测试页做独立对比，页面状态不会影响其他页面。
            </Paragraph>
          </div>

          <Card size="small" title="交互测试">
            <Space.Compact style={{ width: '100%' }}>
              <Input
                aria-label="测试内容"
                placeholder="输入一段内容"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onPressEnter={() => setSubmittedValue(value)}
              />
              <Button type="primary" onClick={() => setSubmittedValue(value)}>
                提交
              </Button>
            </Space.Compact>
          </Card>

          <Card size="small" title="当前结果">
            {submittedValue ? (
              <Space>
                <CheckOutlined style={{ color: '#16a34a' }} />
                <Text>{submittedValue}</Text>
              </Space>
            ) : (
              <Text type="secondary">还没有提交内容</Text>
            )}
          </Card>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setValue('');
              setSubmittedValue('');
            }}
          >
            重置测试状态
          </Button>
        </Space>
      </Card>
    </div>
  );
}
