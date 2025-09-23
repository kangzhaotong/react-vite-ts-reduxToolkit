import React, { useRef, useEffect } from 'react';
import styles from './index.module.less';
const DrawComponent = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {}, []);

  return (
    <div className={styles.container}>
      <div className={styles.drawBox} ref={boxRef}>
        index
      </div>
      <div className={styles.drawBox} ref={boxRef}>
        index
      </div>
      <div className={styles.drawBox} ref={boxRef}>
        index
      </div>
      <div className={styles.drawBox} ref={boxRef}>
        index
      </div>
      <div className={styles.drawBox} ref={boxRef}>
        index
      </div>
      <div className={styles.drawBox} ref={boxRef}>
        index
      </div>
    </div>
  );
};
export default DrawComponent;
