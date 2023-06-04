import { Location } from 'react-router-dom';
import nth from 'lodash/nth';
import { RouteAction, RouteContext, RouteType, RouteVisit } from '../../routes/routeSchema';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';
import { AuthFlowName, AuthFlowResponse, AuthFlowResponseType } from '../auth/authSchema';
import { Routes } from '../../routes/routes';
import { getRelativeUrl } from '../../core/urlUtils';

import { initDev, trace } from '../../dev';
import type { Kernel } from '../../kernel/kernel';
import { HistoryManager } from './historyManager';
import { StorageManager } from './storageManager';
import { action } from 'mobx';
import { Result } from '../../core/types';

export class RoutingService
  extends ServiceBase {

  constructor(kernel: Kernel) {
    super(kernel);

    initDev(this, { color: 'magenta' });
    trace(this);
  }

  readonly serviceName = ServiceName.Routing;

  readonly storage = new StorageManager(this.kernel);
  readonly history = new HistoryManager(this.kernel);

  get contextHistory(): RouteContext[] {
    return this.history.contextHistory;
  }

  get visitHistory(): RouteVisit[] {
    return this.history.visitHistory;
  }

  get lastDirectRoute(): RouteContext | null {
    return this.findVisitContext(ctx => ctx.descriptor.routeType === RouteType.Direct, -1);
  }

  get lastAuthRoute(): RouteContext | null {
    return this.findVisitContext(ctx => ctx.descriptor.routeType === RouteType.Auth, -1);
  }

  get lastPrivateRoute(): RouteContext | null {
    return this.findVisitContext(ctx => ctx.descriptor.routeType === RouteType.Private, -1);
  }

  get lastPublicRoute(): RouteContext | null {
    return this.findVisitContext(ctx => ctx.descriptor.routeType === RouteType.Public, -1);
  }

  get lastContentRoute(): RouteContext | null {
    return this.findVisitContext(ctx =>
      ctx.descriptor.routeType === RouteType.Private ||
      ctx.descriptor.routeType === RouteType.Public, -1);
  }

  registerVisit(location: Location, action: RouteAction) {
    return this.history.registerVisit(location, action);
  }

  getRedirectRouteFromAuthFlowResponse(resp: AuthFlowResponse): string | null {

    switch (resp.responseType) {
      case AuthFlowResponseType.RedirectToLoginPage:
        return Routes.login();

      case AuthFlowResponseType.RedirectToLastContentRoute:
        const lastContentLocation = this.lastContentRoute?.location ?? null;
        return (lastContentLocation ? getRelativeUrl(lastContentLocation) : '/') ?? '/';

      case AuthFlowResponseType.RedirectAfterLogout: {
        const visits = this.visitHistory;
        const fallbackRoute = Routes.login();

        for (let i = visits.length - 1; i >= 0; i--) {
          const visit = visits[i];
          const { routeType } = visit.context.descriptor;

          switch (routeType) {
            case RouteType.Private:
              return fallbackRoute;
            case RouteType.Public:
              return visit.context.location.pathname;
          }
        }

        return fallbackRoute;
      }
    }

    return null;
  }

  executeAuthFlowResponse(resp: AuthFlowResponse): void {
    const route = this.getRedirectRouteFromAuthFlowResponse(resp);
    if (route)
      window.history.pushState(null, '', route);
  }
  
  navigate(route: string, data: any = null) {
    window.history.pushState(null, '', route);
  }

  @action
  clearStorage() {
    return this.storage.clear();
  }

  private findVisit(filter: (visit: RouteVisit) => boolean, index = 0): RouteVisit | null {
    const { visitHistory } = this;
    if (index === 0)
      return visitHistory.find(filter) ?? null;

    return nth(visitHistory.filter(filter), index) ?? null;
  }

  private findVisitContext(filter: (ctx: RouteContext) => boolean, index = 0): RouteContext | null {
    return this.findVisit(visit => filter(visit.context), index)?.context ?? null;
  }
}