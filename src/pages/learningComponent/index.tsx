/*
 * @Author: M78.Kangzhaotong
 * @Date: 2022-12-27 16:21:30
 * @Last Modified by: M78.Kangzhaotong
 * @Last Modified time: 2023-05-29 15:17:28
 */
import React, {
  useState,
  useMemo,
  useCallback,
  useTransition,
  useRef,
  useEffect,
  useDeferredValue
} from 'react';
// import { flushSync } from 'react-dom';
import { Input, Button } from 'antd';
import useSWR from 'swr';
// 整个项目引入一旦躲起来就显得很臃肿
import type { RootState } from '@/store';
// redux原生和dva的区别就是dva的方法按照约定式文件是不需要手动导入的
import {
  increment,
  decrement,
  incrementByAmount
} from '@/store/reducer/counterSlice';
import type { InputRef } from 'antd';
import styles from './index.module.less';
import { fetSwr } from '@/services/api';
interface params {
  data: string;
  handelClick: () => void;
}

const Child: React.FC<params> = ({ data, handelClick }) => {
  console.log('child');
  return <Button onClick={() => handelClick()}>{data}</Button>;
};
const UseMemoChild = React.memo(Child);

const Home: React.FC = () => {
  const inputRef = useRef<InputRef>(null);
  const dispatch = useAppDispatch();
  const counter = useAppSelector((state: RootState) => state.counter.value);
  const initData = useAppSelector((state: RootState) => state.counter.initData);
  const { data } = useSWR('/analysisChart', fetSwr);
  const [name, setName] = useState('name测试');
  const [inputCurrentVal, setInputCurrentVal] = useState('测试');
  const [value, setValue] = useState('');
  const [isTransition, setTransion] = useState(false);

  const deferredValue = useDeferredValue(inputCurrentVal);
  const changeName = useCallback(() => dealName(name), [name]);

  const debounceValue = useDebounce({ value, delay: 2000 });

  const dataName = useMemo(() => name, [name]);
  const dealName = (restName: string) => {
    const newName = `${restName}ceshi`;
    setName(newName);
  };

  const newVal = value + name;

  const startTransition = () => {
    // 触发
    dispatch(decrement());
    setValue(`${inputRef.current?.input?.value}11`);
  };
  const transitionHandle = () => {
    dispatch(increment());
    setTransion(!isTransition);
  };

  return (
    <div className="app">
      <div>
        <span>
          {value}
          {newVal}
          {JSON.stringify(initData)}
        </span>
        <Button onClick={transitionHandle}>
          {isTransition ? 'transition' : 'normal'}{' '}
        </Button>
        <Button type="primary" onClick={startTransition}>
          测试
        </Button>
        <div>
          {debounceValue} {JSON.stringify(data)}
        </div>
        <Input
          style={{ width: 200 }}
          ref={inputRef}
          onChange={(val) => setInputCurrentVal(val.target.value)}
        />
        <UseMemoChild data={dataName} handelClick={changeName} />
        <div className={styles.testBox}>测试盒子{counter}</div>
      </div>
      <div>这是inputdeferredValue {deferredValue}</div>
    </div>
  );
};

export default Home;
