import { action, computed, makeObservable, observable } from 'mobx';
import { Kernel } from '../kernel/kernel';
import { Node } from '../kernel/node';
import { type AuthFlowResponse } from '../services/auth/authSchema';
import { RouteType } from './routeSchema';

import { initDev, trace } from '../dev';

export abstract class BaseRouteState
  extends Node {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'teal' });
    trace(this);
  }

  abstract get routeType(): RouteType;

  abstract get loadTask(): any | null;
  abstract set loadTask(value: any);

  @computed get flowResponse(): AuthFlowResponse | null {
    return this.loadTask?.flowResponse ?? null;
  }

  @computed get isLoading() {
    return this.loadTask?.isRunning ?? false;
  }

  @computed get error() {
    return this.loadTask?.error ?? null;
  }

  private abortController = new AbortController();

  /** 
   * Master abort signal for everything happening inside the route. 
   * Should be passed down to all inner async operations.
   */
  get abortSignal() {
    return this.abortController.signal;
  }

  abstract attached(): void | Promise<void>;

  @action
  detached() {
    trace(this);

    this.abortController.abort();
    this.abortController = new AbortController();
    
    this.loadTask = null;
  }
}