/*
 * @Author: M78.Kangzhaotong
 * @Date: 2023-05-22 13:33:27
 * @Last Modified by: M78.Kangzhaotong
 * @Last Modified time: 2023-05-29 15:32:00
 */
import { Switch } from 'antd';
import { useLayoutStore } from '@/store';

export function DarkModeSwitch() {
  const isDarkMode = useLayoutStore((state) => state.isDarkMode);
  const setDarkMode = useLayoutStore((state) => state.setDarkMode);
  return (
    <Switch
      // style={{ verticalAlign: 'unset' }}
      checked={isDarkMode}
      checkedChildren="🌜"
      unCheckedChildren="🌞"
      onChange={setDarkMode}
    />
  );
}
