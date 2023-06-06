import { action, makeObservable } from 'mobx';
import type { AsyncResult } from '../../core/types';
import { type AuthFlowResponse, AuthFlowResponseType } from '../../services/auth/authSchema';
import { AuthRouteFlow } from '../../services/auth/flows/authRouteFlow';
import { BaseRouteLoadTask } from '../baseRouteLoadTask';

import { Kernel } from '../../kernel/kernel';
import { AbortableProps } from '../../core/types';

import { trace } from '../../dev';

type Props = AbortableProps;

/**
 * Represents the load task for an {@link AuthRouteState}.
 * Uses the {@link AuthRouteFlow} under the hood.
 */
export class AuthRouteLoadTask
  extends BaseRouteLoadTask {

  constructor(kernel: Kernel, props: Props = {}) {
    super(kernel, props);
    makeObservable(this);
  }

  readonly flow = new AuthRouteFlow(this.kernel, {
    abortSignal: this.abortSignal
  });

  @action
  async executor(): AsyncResult<AuthFlowResponse> {

    const [res, err] = await this.flow.run();

    if (err) {
      return this.setCompleted({
        responseType: AuthFlowResponseType.PassThroughAuthRoute,
        error: err
      });
    }

    return this.setCompleted(res!);
  }
}