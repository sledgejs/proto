import { action, computed, makeObservable, observable } from 'mobx';
import { Kernel } from '../kernel/kernel';
import { Node } from '../kernel/node';
import { type AuthFlowResponse } from '../services/auth/authSchema';
import { RouteType } from './routeSchema';
import { Error } from '../errors/error';

import { initDev, trace } from '../dev';

/**
 * Base class for all route state implementations.
 * Abstracts away the abort logic on detachment and some
 * helper getters based on the {@link BaseRouteState.loadTask}.
 */
export abstract class BaseRouteState
  extends Node {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'teal' });
    trace(this);
  }

  /**
   * The qualified route type of this route state.
   */
  abstract get routeType(): RouteType;

  /**
   * Gets or sets the load task for this current instance.
   */
  abstract get loadTask(): any | null;
  abstract set loadTask(value: any);

  /**
   * Gets the resulting flow response from the load task, if the task has settled.
   */
  @computed get flowResponse(): AuthFlowResponse | null {
    return this.loadTask?.flowResponse ?? null;
  }

  /**
   * Returns `true` if the load task is running.
   */
  @computed get isLoading(): boolean {
    return this.loadTask?.isRunning ?? false;
  }

  /**
   * Returns the error which occured on the load task if the task failed.
   */
  @computed get error(): Error {
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

  /**
   * Handler for when the React component is attached to the state.
   */
  abstract attached(): void | Promise<void>;

  /**
   * Handler for when the React component is detached from the state.
   */
  @action
  detached() {
    trace(this);

    this.abortController.abort();
    this.abortController = new AbortController();
    
    this.loadTask = null;
  }
}