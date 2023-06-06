import { action } from 'mobx';
import type { AsyncResult } from '../../../core/types';
import { AuthFlowName, type AuthFlowResponse, type IAuthFlow } from '../authSchema';
import { BaseAuthFlow } from './baseAuthFlow';

import { trace } from '../../../dev';

/**
 * Handles the authentication logic for {@link AuthRoute}.
 * The flow has the following steps:
 * 
 * 1. If the user is authorized and a valid {@link AuthContext} exists,
 * then the user will be redirected to the last private route, such that they don't see
 * an authentication screen if they're already authorized. Otherwise, go to step 2.
 * 
 * 2. Attempt to refresh the session. If this operation succeeds, 
 * redirect to the last private route. Otherwise, go to step 3.
 * 
 * 3. Push the {@link AuthStateType.Unauthorized} state to the application and show the {@link AuthRoute}. 
 */
export class AuthRouteFlow
  extends BaseAuthFlow
  implements IAuthFlow {

  readonly flowName = AuthFlowName.AuthRoute;

  @action
  async run(): AsyncResult<AuthFlowResponse> {
    trace(this);

    const { orchestrator } = this;

    let currContext = orchestrator.getActiveContext();
    if (currContext?.isValid) {
      // user seems to be actually authenticated so we'll redirect them to a private route    
      return this.orchestrator.setRedirectToLastPrivateRoute();
    }

    // no context, try to refresh the session
    return orchestrator.runBatch([
      () => orchestrator.start(this),
      () => orchestrator.batchAuthorizeFromSession(),
      () => orchestrator.setRedirectToLastPrivateRoute()
    ], [
      () => orchestrator.pushUnauthorizedState(),
      () => orchestrator.setPassThroughAuthRoute()
    ]);
  }
}