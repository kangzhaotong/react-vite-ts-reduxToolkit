import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@/router/routes';
import Loading from '@/components/Loading';
import useGlobalTips from '@/hooks/useGlobalTips';

function MyApp() {
  useGlobalTips();
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />
    </Suspense>
  );
}

export default MyApp;
