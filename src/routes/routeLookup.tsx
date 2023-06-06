
import React from 'react';
import { RouteDescriptor, RouteType } from './routeSchema';
import { Routes } from './routes';

const DefaultPage = React.lazy(() => import('../pages/default/defaultPage'));

export const RouteLookup: Record<string, RouteDescriptor> = {

  default: {
    path: Routes.default(),
    routeType: RouteType.Private,
    element: <DefaultPage />
  },

  '*': {
    path: '*',
    routeType: RouteType.Direct,
    element: (
      <div>Not found</div>
    )
  }
}