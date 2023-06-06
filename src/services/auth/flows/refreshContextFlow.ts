import { AuthFlowName, type AuthFlowResponse } from '../authSchema';
import type { AsyncResult } from '../../../core/types';
import { BaseAuthFlow } from './baseAuthFlow';

/**
 * Attempts to refresh a session that exists on the user machine.
 */
export class RefreshContextFlow
  extends BaseAuthFlow {

  readonly flowName = AuthFlowName.RefreshContext;

  async run(): AsyncResult<AuthFlowResponse> {

    const { orchestrator } = this;

    // no context, try to refresh the session
    return orchestrator.runBatch([
      () => orchestrator.start(this),
      () => orchestrator.batchAuthorizeFromSession(),
      () => orchestrator.setAuthorized()
    ], [
      () => orchestrator.pushUnauthorizedState(),
      (err) => orchestrator.setRedirectToLoginPage({ error: err }) // todo: add err param
    ]);
  }
}