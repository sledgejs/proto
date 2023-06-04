import { action } from 'mobx';
import type { AsyncResult } from '../../../core/types';
import { AuthFlowName, type AuthFlowResponse, type IAuthFlow } from '../authSchema';
import { BaseAuthFlow } from './baseAuthFlow';

import { trace } from '../../../dev';

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