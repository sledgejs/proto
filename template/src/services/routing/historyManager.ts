import last from 'lodash/last';
import { Location, matchPath } from 'react-router-dom';
import { initDev, trace } from '../../dev';
import { Error } from '../../errors/error';
import { Kernel } from '../../kernel/kernel';
import { Node } from '../../kernel/node';
import { RouteLookup } from '../../routes/routeLookup';
import { RouteAction, RouteContext, RouteDescriptor, RouteVisit } from '../../routes/routeSchema';

export class HistoryManager
  extends Node {

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

  readonly lookup = RouteLookup;
  readonly contextHistory: RouteContext[] = [];
  readonly visitHistory: RouteVisit[] = [];

  readonly pageContext: RouteContext;

  get context(): RouteContext {
    return last(this.contextHistory) ?? this.pageContext;
  }

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

    throw new Error('Routing.DefaultRouteDescriptorMissing');
  }
}