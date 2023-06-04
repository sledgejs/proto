import { ReactNode, StrictMode, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Providers } from '../integration/providers';
import { RoutingInterceptor } from '../components/routing/routingInterceptor';
import { ErrorCode } from '../errors/errorCode';
import { RouteType } from '../routes/routeSchema';
import { DirectRoute } from '../routes/direct/directRoute';
import { AuthRoute } from '../routes/auth/authRoute';
import { PublicRoute } from '../routes/public/publicRoute';
import { PrivateRoute } from '../routes/private/privateRoute';
import { RouteLookup } from '../routes/routeLookup';
import { DevRuntime } from '../dev/devRuntime';
import { Chunks } from '../integration/chunks';
import { Kernel } from '../kernel/kernel';

import { trace } from '../dev';
import { BackdropPage } from './backdrop/backdropPage';

type Props = {
  kernel: Kernel;
  strictMode: boolean;
}

export const App = observer(({
  kernel,
  strictMode
}: Props) => {

  const { uiService } = kernel;

  trace(DevRuntime, `App render()`);

  const routeElems = Object.keys(RouteLookup).map(key => {

    const descriptor = RouteLookup[key];
    const path = descriptor.path;
    const element: ReactNode = (() => {

      switch (descriptor.routeType) {
        case RouteType.Private: {
          return (
            <PrivateRoute>
              {descriptor.element}
            </PrivateRoute>
          );
        }

        case RouteType.Public: {
          return (
            <PublicRoute>
              {descriptor.element}
            </PublicRoute>
          );
        }

        case RouteType.Auth:
          return (
            <AuthRoute>
              {descriptor.element}
            </AuthRoute>
          );

        case RouteType.Direct:
          return (
            <DirectRoute>
              {descriptor.element}
            </DirectRoute>
          );
      }

      throw new Error(ErrorCode.InternalError);
    })();

    return (
      <Route
        key={path}
        path={path}
        element={element} />
    );
  });

  const suspenseFallback = (
    <BackdropPage />
  );

  const elem = (
    <Providers kernel={kernel}>

      <Helmet>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Helmet>

      <BrowserRouter>
        <Suspense fallback={suspenseFallback}>

          <RoutingInterceptor />

          <div id="app"
            onPointerDown={uiService.handleRootPointerDown}
            onPointerUp={uiService.handleRootPointerUp}
            onPointerCancel={uiService.handleRootPointerCancel}
            onDragStart={uiService.handleRootDragStart}
            onDragEnd={uiService.handleRootDragEnd}
            onDrop={uiService.handleRootDrop}>

            <Routes>
              {routeElems}
            </Routes>
            <Chunks />
          </div>

        </Suspense>
      </BrowserRouter>

    </Providers>
  );

  if (strictMode) {
    return (
      <StrictMode>
        {elem}
      </StrictMode>
    );
  }

  return elem;
});