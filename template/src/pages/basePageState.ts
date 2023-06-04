import { action, computed, makeObservable } from 'mobx';
import { Kernel } from '../kernel/kernel';
import { Node } from '../kernel/node';

import { initDev, trace } from '../dev';

export abstract class BasePageState
  extends Node {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'orange' });
    trace(this);
  }

  abstract get loadTask(): any | null;
  abstract set loadTask(value: any);

  @computed 
  get isLoading() {
    return this.loadTask?.isRunning ?? false;
  }

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

  abstract attached(): void | Promise<void>;

  protected baseAttached() {
    this.abortController = new AbortController();
  }

  @action
  detached() {
    trace(this);
    this.baseDetached();
  }

  @action
  protected baseDetached() {
    this.abortController?.abort();
    this.abortController = null;
    this.loadTask = null;
  }
}