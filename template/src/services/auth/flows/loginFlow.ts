import { action } from 'mobx';
import type { AsyncResult } from '../../../core/types';
import { AuthFlowName, IAuthFlow, type AuthFlowResponse } from '../authSchema';
import type { LoginInput } from '../authInputSchema';
import { BaseAuthFlow } from './baseAuthFlow';

import { trace } from '../../../dev';

/**
 * This flow authenticates the user using credentials.
 */
export class LoginFlow
  extends BaseAuthFlow
  implements IAuthFlow {

  readonly flowName = AuthFlowName.Login;

  @action
  async run(input: LoginInput): AsyncResult<AuthFlowResponse> {
    trace(this);

    const { orchestrator } = this;

    return orchestrator.runBatch([
      () => orchestrator.start(this),
      () => orchestrator.batchAuthorizeFromLogin(input),
      () => orchestrator.setRedirectToLastPrivateRoute()
    ]);
  }
}