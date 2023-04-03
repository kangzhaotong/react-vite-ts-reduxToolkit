import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import RouterAuth from './RouterAuth';
import { ErrorPage } from '@/components/ErrorBoundary';

const Layout = lazy(() => import('@/components/Layout'));
const Login = lazy(() => import('@/pages/login/Login'));
const NotFound = lazy(() => import('@/pages/404'));
const Test = lazy(() => import('@/pages/test'));
const Learning = lazy(() => import('@/pages/learningComponent'));
// const Components = lazy(() => import('@/pages/components'));
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
                path: 'learning',
                element: <Learning />
              },
              {
                path: 'test',
                element: <Test />
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

export default createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL
});
