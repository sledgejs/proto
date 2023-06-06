import { action, computed, makeObservable } from 'mobx';
import { Kernel } from '../kernel/kernel';
import { Node } from '../kernel/node';

import { initDev, trace } from '../dev';

/**
 * Base class for all page state implementations.
 * Abstracts away part of the load and abort logic which most pages have.
 */
export abstract class BasePageState
  extends Node {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'orange' });
    trace(this);
  }

  /**
   * Gets or sets the load task for this current instance.
   */
  abstract get loadTask(): any | null;
  abstract set loadTask(value: any);

  /**
   * Returns `true` if the load task is running.
   */
  @computed 
  get isLoading() {
    return this.loadTask?.isRunning ?? false;
  }

  /**
   * Returns the error which occured on the load task if the task failed.
   */
  @computed 
  get error() {
    return this.loadTask?.error ?? null;
  }

  protected abortController: AbortController | null = null;

  /** 
   * Master abort signal for everything happening inside the page. 
   * Should be passed down to all inner async operations.
   */
  get abortSignal(): AbortSignal | null {
    return this.abortController?.signal ?? null;
  }

  /**
   * Handler for when the React component is attached to the state.
   */
  abstract attached(): void | Promise<void>;

  /**
   * Core logic to be invoked for custom `attached` implementations.
   */
  protected baseAttached() {
    this.abortController = new AbortController();
  }

  /**
   * Handler for when the React component is detached from the state.
   */
  @action
  detached() {
    trace(this);
    this.baseDetached();
  }

  /**
   * Core logic to be invoked for custom `detached` implementations.
   */
  @action
  protected baseDetached() {
    this.abortController?.abort();
    this.abortController = null;
    this.loadTask = null;
  }
}