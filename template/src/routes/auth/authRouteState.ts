import { action, makeObservable, observable } from 'mobx';
import { Kernel } from '../../kernel/kernel';
import { RouteType } from '../routeSchema';
import { BaseRouteState } from '../baseRouteState';
import { AuthRouteLoadTask } from './authRouteLoadTask';

import { trace } from '../../dev';

export class AuthRouteState
  extends BaseRouteState {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);
  }

  readonly routeType = RouteType.Auth;

  @observable loadTask: AuthRouteLoadTask | null = null;

  @action
  async attached() {
    trace(this);

    const task = new AuthRouteLoadTask(this.kernel, {
      abortSignal: this.abortSignal
    });
    this.loadTask = task;

    await task.run();
  }
}