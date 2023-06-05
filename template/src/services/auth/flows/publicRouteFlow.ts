import { action } from 'mobx';
import type { AsyncResult } from '../../../core/types';
import { AuthFlowName, type AuthFlowResponse } from '../authSchema';
import { BaseAuthFlow } from './baseAuthFlow';

import { trace } from '../../../dev';

/**
 * Handles the authentication logic for {@link PublicRoute}.
 * The flow has the following steps:
 * 
 * 1. If the user is authorized and a valid {@link AuthContext} exists,
 * then show the requested public route. Otherwise, go to step 2.
 * 
 * 2. Attempt to refresh the session. If this operation succeeds, 
 * show the requested public route. Otherwise, go to step 3.
 * 
 * 3. Create a new {@link AuthContextType.Anonymous} {@link AuthContext},
 * Push the {@link AuthStateType.Authorized} state to the application 
 * and show the requested public route.
 */
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