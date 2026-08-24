import { LoadingOutlined } from '@ant-design/icons';
import { Spin, Row, Col } from 'antd';
import { useLayoutStore } from '@/store';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

interface LoadingParams {
  height?: string | number;
}

/**
 * 正在加载图标
 * @param {LoadingParams} param0
 * @returns
 */
export default function Loading({ height }: LoadingParams) {
  const isDarkMode = useLayoutStore((state) => state.isDarkMode);
  return (
    <Row
      align="middle"
      justify="center"
      style={{
        height: height || '100vh',
        backgroundColor: isDarkMode ? '#000' : '#fff'
      }}
    >
      <Col>
        <Spin indicator={antIcon} description="加载中...">
          <div style={{ width: 80, height: 80 }} />
        </Spin>
      </Col>
    </Row>
  );
}
