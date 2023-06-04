import { action } from 'mobx';
import type { AsyncResult } from '../../../core/types';
import { AuthFlowName, type AuthFlowResponse } from '../authSchema';
import { BaseAuthFlow } from './baseAuthFlow';

import { trace } from '../../../dev';

export class PublicRouteFlow
  extends BaseAuthFlow {

  readonly flowName = AuthFlowName.PublicRoute;

  @action
  async run(): AsyncResult<AuthFlowResponse> {

    trace(this);

    const { orchestrator } = this;

    let currContext = orchestrator.getActiveContext();
    if (currContext?.isValid) {
      trace(this, `Valid context found, return a 'PassThroughPublicRoute' response`);
      return orchestrator.runBatch([
        () => orchestrator.start(this),
        () => orchestrator.setPassThroughPublicRoute()
      ]);
    }

    trace(this, `A valid context is not set, try to load the context from session`);

    // no context, try to refresh the session
    return orchestrator.runBatch([
      () => orchestrator.start(this),
      () => orchestrator.batchAuthorizeFromSession(),
      () => orchestrator.setPassThroughPublicRoute()
    ], [
      () => orchestrator.createAnonymousContext(),
      () => orchestrator.pushAuthorizedState(),
      () => orchestrator.setPassThroughPublicRoute()
    ]);
  }
}