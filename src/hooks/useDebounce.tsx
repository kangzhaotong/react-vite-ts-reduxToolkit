import { useState, useEffect } from 'react';

interface Props {
  value: any;
  delay: number;
}
const useDebounce = ({ value, delay }: Props) => {
  const [debouncedVal, setDebouncedVal] = useState(value);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedVal(value);
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [delay, value]);
  return debouncedVal;
};
export default useDebounce;
