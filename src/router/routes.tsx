import { lazy } from 'react';
import { createHashRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import RouterAuth from './RouterAuth';
import { ErrorPage } from '@/components/ErrorBoundary';

const Layout = lazy(() => import('@/components/Layout'));
const Login = lazy(() => import('@/pages/login/Login'));
const ThreeMapDemo = lazy(() => import('@/pages/threeMapDemo/index'));
const NotFound = lazy(() => import('@/pages/404'));
const Test = lazy(() => import('@/pages/test'));
const DrawGl = lazy(() => import('@/pages/drawGl/index'));
const Learning = lazy(() => import('@/pages/learningComponent'));
const ThreeDemo = lazy(() => import('@/pages/threeDemo'));
const CustomBreadcrumb = lazy(() => import('@/pages/custom-breadcrumb'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const DemoPage = lazy(() => import('@/pages/demoPage'));
const RtkTest = lazy(() => import('@/pages/rtkTest'));
const Test2 = lazy(() => import('@/pages/test2'));

export const routes: RouteObject[] = [
  {
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/login',
        element: <Login />
      },
      {
        element: <RouterAuth />,
        children: [
          {
            path: '/',
            element: <Layout />,
            children: [
              {
                index: true,
                element: <Dashboard />
              },
              {
                path: 'components',
                // element: <Components />,
                children: [
                  // { index: true, element: <Components /> },
                  { path: 'customBreadcrumb', element: <CustomBreadcrumb /> }
                ]
              },
              {
                path: 'threeMapDemo',
                element: <ThreeMapDemo />
              },
              {
                path: 'drawGl',
                element: <DrawGl />
              },
              {
                path: 'learning',
                element: <Learning />
              },
              {
                path: 'rtkTest',
                element: <RtkTest />
              },
              {
                path: 'test2',
                element: <Test2 />
              },
              {
                path: 'threeDemo',
                element: <ThreeDemo />
              },
              {
                path: 'demoPage',
                element: <DemoPage />
              },
              {
                path: '*',
                element: <NotFound />
              }
            ]
          },
          {
            path: '/test',
            element: <Test />
          }
        ]
      }
    ]
  }
];

export default createHashRouter(routes, {
  basename: import.meta.env.BASE_URL
});
