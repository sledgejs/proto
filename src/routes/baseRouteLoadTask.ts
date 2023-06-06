import { action, computed, makeObservable } from 'mobx';
import { AbortableProps } from '../core/types';
import { Kernel } from '../kernel/kernel';
import { Node } from '../kernel/node';
import { BaseTask } from '../tasks/baseTask';
import type { AuthFlowResponse, IAuthFlow } from '../services/auth/authSchema';
import { AsyncResult } from '../core/types';
import { Error } from '../errors/error';

type Props = AbortableProps;

export type BaseRouteLoadTaskProps = Props;

/**
 * Base class for all route load task implementations.
 * Abstracts away all the backing task logic and some helpers
 * to set the result using the resulting flow response.
 */
export abstract class BaseRouteLoadTask
  extends BaseTask<AuthFlowResponse> {

  constructor(kernel: Kernel, props: Props = {}) {
    super(kernel, props);
    makeObservable(this);
  }

  /**
   * The flow which will be executed by the task.
   * Must be initialized when initializing the task.
   */
  abstract get flow(): IAuthFlow;

  /**
   * Gets the resulting flow response if the task has settled.
   */
  @computed get flowResponse(): AuthFlowResponse | null {
    return this.delegate.value;
  }

  /**
   * The actual task implementation function used by the base task logic.
   */
  abstract executor(): AsyncResult<AuthFlowResponse>;

  @action
  protected setFlowResponse(res: AuthFlowResponse) {
    return this.delegate.setCompleted(res);
  }

  @action
  protected setError(err: Error) {
    return this.delegate.setError(err);
  }
}