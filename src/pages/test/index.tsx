import { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import styles from './index.module.less';

const FlowchartCanvas = lazy(() => import('./FlowchartCanvas'));

export default function DemoFlowchart() {
  return (
    <Suspense
      fallback={
        <div className={styles.flowBox}>
          <div className={styles.flowLoading}>
            <Spin size="large" tip="正在加载流程图编辑器..." />
          </div>
        </div>
      }
    >
      <FlowchartCanvas />
    </Suspense>
  );
}
