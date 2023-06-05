import { action } from 'mobx';
import type { AsyncResult } from '../../../core/types';
import { AuthFlowName, type IAuthFlow, type AuthFlowResponse } from '../authSchema';
import { BaseAuthFlow } from './baseAuthFlow';

import { trace } from '../../../dev';

/**
 * Handles the authentication logic for {@link PrivateRoute}.
 * The flow has the following steps:
 * 
 * 1. If the user is authorized and a valid {@link AuthContext} exists,
 * then show the requested private route. Otherwise, go to step 2.
 * 
 * 2. Attempt to refresh the session. If this operation succeeds, 
 * show the requested private route. Otherwise, go to step 3.
 * 
 * 3. Push the {@link AuthStateType.Unauthorized} state to the application 
 * and redirect to the login page.
 */
export class PrivateRouteFlow
  extends BaseAuthFlow
  implements IAuthFlow {

  readonly flowName = AuthFlowName.PrivateRoute;

  @action
  async run(): AsyncResult<AuthFlowResponse> {

    trace(this);

    const { orchestrator } = this;

    // no authenticated context, try and get one
    let currContext = orchestrator.getActiveContext();
    if (currContext?.isValid) {
      trace(this, `Valid context found, return a 'PassThroughPrivateRoute' response`);
      return orchestrator.runBatch([
        () => orchestrator.start(this),
        () => orchestrator.setPassThroughPrivateRoute()
      ]);
    }

    trace(this, `A valid context is not set, try to load the context from session`);

    // no context, try to refresh the session
    const result = await orchestrator.runBatch([
      () => orchestrator.start(this),
      () => orchestrator.batchAuthorizeFromSession(),
      () => orchestrator.setPassThroughPrivateRoute()
    ], [

      () => orchestrator.pushUnauthorizedState(),
      () => orchestrator.setRedirectToLoginPage()
    ]);

    trace(this, `Flow completed with result: `, result);
    return result;
  }
}