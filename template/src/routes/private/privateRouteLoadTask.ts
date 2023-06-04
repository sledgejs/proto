import { action } from 'mobx';
import type { AsyncResult } from '../../core/types';
import { type AuthFlowResponse, AuthFlowResponseType } from '../../services/auth/authSchema';
import { PrivateRouteFlow } from '../../services/auth/flows/privateRouteFlow';
import { BaseRouteLoadTask } from '../baseRouteLoadTask';

import { trace } from '../../dev';

export class PrivateRouteLoadTask
  extends BaseRouteLoadTask {

  readonly flow = new PrivateRouteFlow(this.kernel, {
    abortSignal: this.abortSignal
  });

  @action
  async executor(): AsyncResult<AuthFlowResponse> {

    const [res, err] = await this.flow.run();

    trace(this, `Flow completed with result`, [res, err]);

    if (err) {
      return this.setCompleted({
        responseType: AuthFlowResponseType.RedirectToLoginPage,
        error: err
      });
    }

    return this.setCompleted(res!);
  }
}