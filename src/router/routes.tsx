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
const Learning = lazy(() => import('@/pages/learningComponent'));
const ThreeDemo = lazy(() => import('@/pages/threeDemo'));
const CustomBreadcrumb = lazy(() => import('@/pages/custom-breadcrumb'));
const Dashboard = lazy(() => import('@/pages/dashboard'));

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
                path: 'learning',
                element: <Learning />
              },
              {
                path: 'test',
                element: <Test />
              },
              {
                path: 'threeDemo',
                element: <ThreeDemo />
              },
              {
                path: '*',
                element: <NotFound />
              }
            ]
          }
        ]
      }
    ]
  }
];

export default createHashRouter(routes, {
  basename: import.meta.env.BASE_URL
});
