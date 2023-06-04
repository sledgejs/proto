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

export abstract class BaseRouteLoadTask
  extends BaseTask<AuthFlowResponse> {

  constructor(kernel: Kernel, props: Props = {}) {
    super(kernel, props);
    makeObservable(this);
  }

  abstract get flow(): IAuthFlow;

  @computed get flowResponse(): AuthFlowResponse | null {
    return this.delegate.value;
  }

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