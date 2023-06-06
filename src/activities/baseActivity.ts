import { action, computed, makeObservable } from 'mobx';
import { nanoid } from 'nanoid';
import { Error } from '../errors/error';
import { Node } from '../kernel/node';
import { ActivityDelegate } from './activityDelegate';
import { ActivityStatus, type DefaultActivityValueType, type IActivity } from './activitySchema';

import type { AsyncResult, Result } from '../core/types';
import type { AbortableProps } from '../core/types';
import type { Kernel } from '../kernel/kernel';

type Props<T = DefaultActivityValueType, TModel = any> = AbortableProps & {
  model?: TModel | null;
};

export type BaseActivityProps<T = DefaultActivityValueType, TModel = any> = Props<T, TModel>;

/**
 * Base implementation for an {@link IActivity} which can be
 * used by all activity implementations in the application.
 */
export abstract class BaseActivity<T = DefaultActivityValueType, TModel = any>
  extends Node
  implements IActivity<T> {

  constructor(kernel: Kernel, props: Props = {}) {
    super(kernel);
    makeObservable(this);

    this.delegate = new ActivityDelegate<T, TModel>(this.kernel, props);
  }

  /**
   * Delegate which manages all the logic for the activity.
   */
  readonly delegate: ActivityDelegate<T, TModel>;

  /** @inheritDoc IActivity.activityId */
  readonly activityId = nanoid();

  /** @inheritDoc IActivity.label */
  readonly label: string | null = null;

  /** @inheritDoc IActivity.model */
  get model(): TModel | null {
    return this.delegate.model;
  }

  /** @inheritDoc IActivity.abortSignal */
  get abortSignal(): AbortSignal | null {
    return this.delegate.abortSignal;
  }

  /** @inheritDoc IActivity.promise */
  get promise(): AsyncResult<T> {
    return this.delegate.promise;
  }

  /** @inheritDoc IActivity.status */
  @computed
  get status(): ActivityStatus {
    return this.delegate.status;
  }

  /** @inheritDoc IActivity.result */
  @computed
  get result(): Result<T> | null {
    return this.delegate.result;
  }

  /** @inheritDoc IActivity.value */
  @computed
  get value(): T | null {
    return this.delegate.value;
  }

  /** @inheritDoc IActivity.error */
  @computed
  get error(): Error | null {
    return this.delegate.error;
  }

  /** @inheritDoc IActivity.isIdle */
  @computed
  get isIdle() {
    return this.delegate.isIdle;
  }

  /** @inheritDoc IActivity.isStarted */
  @computed
  get isStarted() {
    return this.delegate.isStarted;
  }

  /** @inheritDoc IActivity.isCompleted */
  @computed
  get isCompleted() {
    return this.delegate.isCompleted;
  }

  /** @inheritDoc IActivity.isError */
  @computed
  get isError() {
    return this.delegate.isError;
  }

  /** @inheritDoc IActivity.isError */
  @computed
  get isCanceled() {
    return this.delegate.isCanceled;
  }

  /** @inheritDoc IActivity.isSettled */
  @computed
  get isSettled() {
    return this.delegate.isSettled;
  }

  /** @inheritDoc IActivity.isAborted */
  @computed
  get isAborted() {
    return this.delegate.isAborted;
  }

  /** @inheritDoc IActivity.start */
  @action
  async start(): AsyncResult<T> {

    this.delegate.setStarted();

    const [res, err] = await this.executor();

    if (err) {
      this.delegate.setError(err);
      return [null, err];
    }

    this.delegate.setCompleted(res);
    return [res];
  }

  protected abstract executor(): AsyncResult<T>;

  protected setError(err: Error) {
    return this.delegate.setError(err);
  }

  protected setCompleted(res: T) {
    return this.delegate.setCompleted(res);
  }
}