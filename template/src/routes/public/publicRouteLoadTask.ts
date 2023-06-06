import { action } from 'mobx';
import type { AsyncResult } from '../../core/types';
import { type AuthFlowResponse, AuthFlowResponseType } from '../../services/auth/authSchema';
import { PublicRouteFlow } from '../../services/auth/flows/publicRouteFlow';
import { BaseRouteLoadTask } from '../baseRouteLoadTask';

import { trace } from '../../dev';

/**
 * Represents the load task for a {@link PublicRouteState}.
 * Uses the {@link PublicRouteFlow} under the hood.
 */
export class PublicRouteLoadTask
  extends BaseRouteLoadTask {

  readonly flow: PublicRouteFlow = new PublicRouteFlow(this.kernel, {
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