import { action, makeObservable, observable } from 'mobx';
import { Kernel } from '../../kernel/kernel';
import { RouteType } from '../routeSchema';
import { BaseRouteState } from '../baseRouteState';
import { PrivateRouteLoadTask } from './privateRouteLoadTask';

import { trace } from '../../dev';

export class PrivateRouteState
  extends BaseRouteState {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);
  }

  readonly routeType = RouteType.Private;

  @observable loadTask: PrivateRouteLoadTask | null = null;

  @action
  async attached() {
    trace(this);

    const task = new PrivateRouteLoadTask(this.kernel, {
      abortSignal: this.abortSignal
    });
    this.loadTask = task;

    await task.run();
  }
}