import { action } from 'mobx';
import type { AsyncResult } from '../../../core/types';
import { AuthFlowName, type AuthFlowResponse, type IAuthFlow } from '../authSchema';
import { BaseAuthFlow } from './baseAuthFlow';

import { trace } from '../../../dev';

export class LogoutFlow
  extends BaseAuthFlow
  implements IAuthFlow {

  readonly flowName = AuthFlowName.Logout;

  @action
  async run(): AsyncResult<AuthFlowResponse> {
    trace(this);

    const { orchestrator } = this;

    return orchestrator.runBatch([
      () => orchestrator.start(this),
      () => orchestrator.invalidate(),
      () => orchestrator.logout(),
      () => orchestrator.setAwaitRedirect()
    ]);
  }
}