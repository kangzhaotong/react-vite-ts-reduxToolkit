import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Typography
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { message } from '@/hooks/useGlobalTips';

const { TextArea } = Input;
const { Text } = Typography;

/** 支持英文逗号、中文逗号分隔 */
export function parseVariableKeysFromApi(str) {
  if (str == null || String(str).trim() === '') return [];
  return String(str)
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 将模板中的 ${key} 替换为已填写的 value；未填的保留占位符 */
export function applyTemplateVariables(template, variableValues = {}) {
  if (!template) return '';
  return template.replace(/\$\{([^}]+)\}/g, (full, rawKey) => {
    const key = String(rawKey).trim();
    const val = variableValues[key];
    if (val === undefined || val === null || String(val).trim() === '') {
      return full;
    }
    return String(val);
  });
}

/**
 * 模拟：根据所选模板拉取详情（含变量名字符串、模板正文）
 * 接口返回 variablesStr 示例：'order,name' 或 'order，shop'
 */
async function fetchSmsTemplateDetail(templateKey) {
  await new Promise((r) => setTimeout(r, 280));
  const map = {
    tpl1: {
      templateName: '查看预约单短信模板',
      templateId: 'HL-001',
      variablesStr: 'order',
      templateContent:
        '您好，为提供便捷服务，请打开远程慧联小程序点击右上角打开“我的预约”，点开查看订单${order}详情。'
    },
    tpl2: {
      templateName: '到店提醒模板',
      templateId: 'HL-002',
      variablesStr: 'order,name',
      templateContent: '尊敬的${name}，您的订单${order}已到店，请及时取件。'
    }
  };
  return map[templateKey] ?? map.tpl1;
}

const TEMPLATE_OPTIONS = [
  { label: '查看预约单短信模板', value: 'tpl1' },
  { label: '到店提醒模板', value: 'tpl2' }
];

const formItemLayout = {
  labelCol: { xs: 24, sm: 6 },
  wrapperCol: { xs: 24, sm: 16 }
};

export default function SendSmsPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [variableKeys, setVariableKeys] = useState([]);
  const [templateRaw, setTemplateRaw] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  const variableValues = Form.useWatch('variableValues', form) || {};

  const previewContent = useMemo(
    () => applyTemplateVariables(templateRaw, variableValues),
    [templateRaw, variableValues]
  );

  const loadTemplateDetail = useCallback(
    async (templateKey) => {
      if (!templateKey) return;
      setDetailLoading(true);
      try {
        const detail = await fetchSmsTemplateDetail(templateKey);
        setTemplateRaw(detail.templateContent || '');
        const keys = parseVariableKeysFromApi(detail.variablesStr);
        setVariableKeys(keys);
        form.setFieldsValue({
          templateId: detail.templateId,
          variableValues: keys.reduce((acc, k) => {
            acc[k] = '';
            return acc;
          }, {})
        });
      } finally {
        setDetailLoading(false);
      }
    },
    [form]
  );

  useEffect(() => {
    const first = TEMPLATE_OPTIONS[0]?.value;
    if (first) {
      form.setFieldsValue({ templateName: first });
      void loadTemplateDetail(first);
    }
  }, [form, loadTemplateDetail]);

  const onTemplateChange = (value) => {
    void loadTemplateDetail(value);
  };

  const onFinish = (values) => {
    if (!String(templateRaw || '').trim()) {
      message.error('请先选择有效的短信模板');
      return;
    }
    const payload = {
      ...values,
      templatePreview: applyTemplateVariables(
        templateRaw,
        values.variableValues || {}
      )
    };
    console.log('发送短信 payload:', payload);
    message.success('已提交（示例：见控制台）');
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <Card title="发送短信" variant="borderless">
        <Spin spinning={detailLoading}>
          <Form
            {...formItemLayout}
            form={form}
            layout="horizontal"
            onFinish={onFinish}
            scrollToFirstError
          >
            <Form.Item
              name="templateName"
              label="短信模板名称"
              rules={[{ required: true, message: '请选择短信模板名称' }]}
            >
              <Select
                placeholder="请选择"
                options={TEMPLATE_OPTIONS}
                onChange={onTemplateChange}
              />
            </Form.Item>

            <Form.Item
              name="templateId"
              label="短信模板ID"
              rules={[{ required: true, message: '请输入短信模板ID' }]}
            >
              <Input placeholder="由接口回显" allowClear />
            </Form.Item>

            <Form.Item label="变量">
              <Space
                orientation="vertical"
                style={{ width: '100%' }}
                size="middle"
              >
                {variableKeys.length === 0 ? (
                  <Text type="secondary">暂无变量（接口未返回或为空）</Text>
                ) : (
                  variableKeys.map((key) => (
                    <Space.Compact
                      key={key}
                      style={{ width: '100%', maxWidth: 520 }}
                    >
                      <Input
                        style={{ width: 140, textAlign: 'center' }}
                        value={key}
                        readOnly
                        title="变量名（来自接口）"
                      />
                      <Form.Item name={['variableValues', key]} noStyle>
                        <Input
                          placeholder={`请填写 ${key} 对应的值`}
                          style={{ flex: 1 }}
                        />
                      </Form.Item>
                    </Space.Compact>
                  ))
                )}
              </Space>
            </Form.Item>

            <Form.Item
              label="短信模板"
              required
              tooltip="下方为根据变量实时替换后的预览；提交时以替换后的内容为准"
            >
              <TextArea
                rows={5}
                value={previewContent}
                readOnly
                placeholder="选择模板并填写变量后将在此展示预览"
              />
            </Form.Item>

            <Form.Item
              name="recipients"
              label="接收人"
              rules={[{ required: true, message: '请输入接收人' }]}
            >
              <Input placeholder="多个号码用英文逗号分隔，如：13111111111,13122222222" />
            </Form.Item>

            <Form.Item wrapperCol={{ xs: 24, sm: { span: 16, offset: 6 } }}>
              <Space>
                <Button onClick={onCancel}>取消</Button>
                <Button type="primary" htmlType="submit">
                  发送
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}
