import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { fetchIsTokenValid } from '@/services/api';
import { useUserStore } from '@/store';
import { useRequest } from 'ahooks';

/**
 * 路由守卫
 * @description 验证用户token是否在有效期。
 */
export default function RouterAuth() {
  const location = useLocation();
  const token = useUserStore((state) => state.token);

  const { data: tokenIsValid = true, run } = useRequest(fetchIsTokenValid, {
    manual: true
  });

  useEffect(() => {
    run();
  }, [location]);

  // if (!token || !tokenIsValid) {
  //   return <Navigate to="/login" state={location} replace />;
  // }
  return <Outlet />;
}
