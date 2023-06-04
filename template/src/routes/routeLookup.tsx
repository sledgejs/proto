
import React from 'react';
import { RouteDescriptor, RouteType } from './routeSchema';
import { Routes } from './routes';
import NotFoundErrorPage from '../pages/error/notFoundErrorPage';

const LoginPage = React.lazy(() => import('../pages/auth/login/loginPage'));
const LogoutPage = React.lazy(() => import('../pages/auth/logout/logoutPage'));
const DefaultPage = React.lazy(() => import('../pages/default/defaultPage'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/dashboardPage'));

export const RouteLookup: Record<string, RouteDescriptor> = {

  default: {
    path: Routes.default(),
    routeType: RouteType.Private,
    element: <DefaultPage />
  },

  login: {
    path: Routes.login(),
    routeType: RouteType.Auth,
    element: <LoginPage />,
  },

  logout: {
    path: Routes.logout(),
    routeType: RouteType.Direct,
    element: <LogoutPage />,
  },

  dashboard: {
    path: Routes.dashboard(),
    routeType: RouteType.Private,
    element: <DashboardPage />
  },

  '*': {
    path: '*',
    routeType: RouteType.Direct,
    element: <NotFoundErrorPage />
  }
}