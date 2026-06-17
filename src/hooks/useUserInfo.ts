import { fetchUserInfo } from '@/services/api';
import { getUserState, setUserInfo, useUserStore } from '@/store';

export const useUserInfo = function () {
  return useUserStore((state) => state.userInfo);
};

export const initUserInfo = async function () {
  const user = getUserState();
  if (!user.token) {
    return;
  }
  const userInfo = await fetchUserInfo();
  setUserInfo(userInfo);
};
