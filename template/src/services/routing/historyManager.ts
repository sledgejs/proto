import last from 'lodash/last';
import { Location, matchPath } from 'react-router-dom';
import { initDev, trace } from '../../dev';
import { Error } from '../../errors/error';
import { ErrorCode } from '../../errors/errorCode';
import { Kernel } from '../../kernel/kernel';
import { Node } from '../../kernel/node';
import { RouteLookup } from '../../routes/routeLookup';
import { RouteAction, RouteContext, RouteDescriptor, RouteVisit } from '../../routes/routeSchema';

/**
 * Manages the routing history for the {@link RoutingService}.
 */
export class HistoryManager
  extends Node {

  /**
   * Creates a new instance of {@link HistoryManager}.
   */
  constructor(kernel: Kernel) {
    super(kernel);

    initDev(this, { color: 'black' });
    trace(this);

    const winLoc = window.location;
    const winHistory = window.history;

    const currLoc: Location = {
      hash: winLoc.hash,
      key: 'initial',
      pathname: winLoc.pathname,
      search: winLoc.search,
      state: winHistory.state
    }

    this.registerVisit(currLoc, RouteAction.Push);
    this.pageContext = this.context;
  }

  private readonly lookup = RouteLookup;
  
  /**
   * The list of {@link RouteContext} objects, including the current one.
   * This list can be modified freely depending on the {@link RouteAction}
   * used to register new visits.
   */
  readonly contextHistory: RouteContext[] = [];

  /**
   * The list of {@link RouteVisit} objects, including the current one.
   * This list is always growing, regardless of the {@link RouteAction}
   * used to register new visits.
   */
  readonly visitHistory: RouteVisit[] = [];

  /**
   * Gets the {@link RouteContext} representing the initial visit.
   */
  readonly pageContext: RouteContext;

  /**
   * Gets the current {@link RouteContext} representing the current route.
   */
  get context(): RouteContext {
    return last(this.contextHistory) ?? this.pageContext;
  }

  /**
   * Registers a new visit and adds it to the history.
   * @param location  The `react-router-dom` `Location` object based on which to create the visit.
   * @param action    Specifies how the `RouteVisit` should be added (pushed, popped or replaced).
   */
  registerVisit(location: Location, action: RouteAction) {
    const { contextHistory, visitHistory } = this;

    switch (action) {
      case RouteAction.Push: {
        const context: RouteContext = {
          location: location,
          descriptor: this.getDescriptor(location)
        };
        contextHistory.push(context);
      } break;

      case RouteAction.Pop:
        contextHistory.pop();
        break;

      case RouteAction.Replace: {
        const context: RouteContext = {
          location: location,
          descriptor: this.getDescriptor(location)
        };
        contextHistory.pop();
        contextHistory.push(context);
      } break;
    }

    const { context } = this;
    const history = window.history;

    const pageVisit: RouteVisit = {
      action,
      context,
      index: this.visitHistory.length,
      historyIndex: history?.length ?? 0
    }

    visitHistory.push(pageVisit);
  }

  private getDescriptor(location: Location): RouteDescriptor {

    const { lookup } = this;
    const lookupPaths = Object.keys(lookup);

    for (const lookupKey of lookupPaths) {

      const desc = lookup[lookupKey];
      if (matchPath(desc.path, location.pathname))
        return desc;
    }

    throw new Error(ErrorCode['Routing.DefaultRouteDescriptorMissing']);
  }
}