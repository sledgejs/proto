import { Location } from 'react-router-dom';
import { action } from 'mobx';
import nth from 'lodash/nth';
import { RouteAction, type RouteContext, RouteType, type RouteVisit } from '../../routes/routeSchema';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';
import { type AuthFlowResponse, AuthFlowResponseType } from '../auth/authSchema';
import { Routes } from '../../routes/routes';
import { getRelativeUrl } from '../../core/urlUtils';

import { HistoryManager } from './historyManager';
import { StorageManager } from './storageManager';

import type { Kernel } from '../../kernel/kernel';

import { initDev, trace } from '../../dev';

/**
 * Service which manages routing-related operations for the application.
 */
export class RoutingService
  extends ServiceBase {

  /**
   * Creates a new instance of {@link RoutingService}.
   */
  constructor(kernel: Kernel) {
    super(kernel);

    initDev(this, { color: 'magenta' });
    trace(this);
  }

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.Routing;

  /**
   * Reference to the {@link StorageManager} set on the current instance.
   */
  readonly storage = new StorageManager(this.kernel);
  
  /**
   * Reference to the {@link HistoryManager} set on the current instance.
   */
  readonly history = new HistoryManager(this.kernel);

  /**
   * Returns the last {@link RouteContext} in the history which is for a 
   * {@link RouteType.Direct} route or `null` if none exists.
   */
  get lastDirectRoute(): RouteContext | null {
    return this.findVisitContext(ctx => ctx.descriptor.routeType === RouteType.Direct, -1);
  }

  /**
   * Returns the last {@link RouteContext} in the history which is for a 
   * {@link RouteType.Auth} route or `null` if none exists.
   */
  get lastAuthRoute(): RouteContext | null {
    return this.findVisitContext(ctx => ctx.descriptor.routeType === RouteType.Auth, -1);
  }

  /**
   * Returns the last {@link RouteContext} in the history which is for a 
   * {@link RouteType.Private} route or `null` if none exists.
   */
  get lastPrivateRoute(): RouteContext | null {
    return this.findVisitContext(ctx => ctx.descriptor.routeType === RouteType.Private, -1);
  }

  /**
   * Returns the last {@link RouteContext} in the history which is for a 
   * {@link RouteType.Public} route or `null` if none exists.
   */
  get lastPublicRoute(): RouteContext | null {
    return this.findVisitContext(ctx => ctx.descriptor.routeType === RouteType.Public, -1);
  }

  /**
   * Returns the last {@link RouteContext} in the history which is for a 
   * {@link RouteType.Public} or {@link RouteType.Private} route or `null` if none exists.
   */
  get lastContentRoute(): RouteContext | null {
    return this.findVisitContext(ctx =>
      ctx.descriptor.routeType === RouteType.Private ||
      ctx.descriptor.routeType === RouteType.Public, -1);
  }

  private get visitHistory(): RouteVisit[] {
    return this.history.visitHistory;
  }

  /**
   * Registers a new visit to the history.
   * @see {@link HistoryManager.registerVisit}
   */
  registerVisit(location: Location, action: RouteAction) {
    return this.history.registerVisit(location, action);
  }

  /**
   * Interprets an {@link AuthFlowResponse} and returns the route to redirect to,
   * or `null` if the response does not require a redirect.
   * 
   * @param response The response to interpret.
   */
  getRedirectRouteFromAuthFlowResponse(response: AuthFlowResponse): string | null {

    switch (response.responseType) {
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

  /**
   * Interprets an {@link AuthFlowResponse} and redirects the page to the 
   * resulting route if the response requires a redirect.
   * 
   * @param response The response to interpret.
   */
  executeAuthFlowResponse(response: AuthFlowResponse): void {
    const route = this.getRedirectRouteFromAuthFlowResponse(response);
    if (route)
      window.history.pushState(null, '', route);
  }
  
  /**
   * Navigates to a new route programatically.
   * 
   * @param response The response to interpret.
   */
  navigate(route: string, data: any = null) {
    window.history.pushState(null, '', route);
  }

  /**
   * Clears the storage associated with routing.
   * @see {@link StorageManager.clear}
   */
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