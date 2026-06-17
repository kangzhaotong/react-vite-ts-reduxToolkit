import { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import styles from './index.module.less';

const ThreeMapScene = lazy(() => import('./ThreeMapScene'));

export default function ThreeMapDemo() {
  return (
    <Suspense
      fallback={
        <div className={styles.mapWrap}>
          <div className={styles.mapLoading}>
            <Spin size="large" tip="正在加载三维地图场景..." />
          </div>
        </div>
      }
    >
      <ThreeMapScene />
    </Suspense>
  );
}
