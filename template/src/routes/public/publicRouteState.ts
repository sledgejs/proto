import { action, makeObservable, observable } from 'mobx';
import { Kernel } from '../../kernel/kernel';
import { RouteType } from '../routeSchema';
import { BaseRouteState } from '../baseRouteState';
import { PublicRouteLoadTask } from './publicRouteLoadTask';

import { trace } from '../../dev';

/**
 * Represents the model for the {@link PublicRoute} component.
 * Loads using {@link PublicRouteLoadTask}.
 */
export class PublicRouteState
  extends BaseRouteState {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);
  }

  readonly routeType = RouteType.Public;

  @observable loadTask: PublicRouteLoadTask | null = null;

  @action
  async attached() {
    trace(this);

    const task = new PublicRouteLoadTask(this.kernel, {
      abortSignal: this.abortSignal
    });
    this.loadTask = task;

    await task.run();
  }
}