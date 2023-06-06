import { action, computed, makeObservable, observable } from 'mobx';
import { PromiseRelay } from '../core/async/promiseRelay';
import { ErrorCode } from '../errors/errorCode';
import { toError } from '../errors/errorUtils';
import { Node } from '../kernel/node';
import { ActivityStatus } from './activitySchema';

import type { Error } from '../errors/error';
import type { AbortableProps, AsyncResult, Result } from '../core/types';
import type { Kernel } from '../kernel/kernel';

import { error, trace } from '../dev';

type Props<T, TModel> = AbortableProps & {
  model?: TModel | null;
}

/**
 * @experimental
 * 
 * An Activity describes user interactions like forms, dialogs, etc,
 * and instead of interacting with the state via events and callbacks,
 * an Activity reports the progress via promises (and in the future, generators).
 * This allows for opening, consuming the result, and closing the UI component
 * responsible for the interaction in the same method from the parent component.
 */
export class ActivityDelegate<T, TModel>
  extends Node {

  constructor(kernel: Kernel, props: Props<T, TModel>) {
    super(kernel);
    makeObservable(this);

    this.model = props?.model ?? null;

    this.abortSignal = props.abortSignal ?? null;
  }

  /** @inheritDoc IActivity.abortSignal */
  readonly abortSignal: AbortSignal | null = null;

  private readonly promiseRelay = new PromiseRelay<Result<T>>();
  
  /** @inheritDoc IActivity.promise */
  get promise(): AsyncResult<T> {
    return this.promiseRelay.promise;
  }

  /** @inheritDoc IActivity.model */
  readonly model: TModel | null;

  /** @inheritDoc IActivity.status */
  @observable status: ActivityStatus = ActivityStatus.Idle;
  
  /** @inheritDoc IActivity.result */
  @observable.shallow result: Result<T> | null = null;

  /** @inheritDoc IActivity.value */
  @computed
  get value(): T | null {
    return this.result?.[0] ?? null;
  }

  /** @inheritDoc IActivity.error */
  @computed
  get error(): Error | null {
    return this.result?.[1] ?? null;
  }

  /** @inheritDoc IActivity.isIdle */
  @computed
  get isIdle() {
    return this.status === ActivityStatus.Idle;
  }

  /** @inheritDoc IActivity.isStarted */
  @computed
  get isStarted() {
    return this.status === ActivityStatus.Started;
  }

  /** @inheritDoc IActivity.isCompleted */
  @computed
  get isCompleted() {
    return this.status === ActivityStatus.Completed;
  }

  /** @inheritDoc IActivity.isError */
  @computed
  get isError() {
    return this.status === ActivityStatus.Error;
  }

  /** @inheritDoc IActivity.isCanceled */
  @computed
  get isCanceled() {
    return this.status === ActivityStatus.Canceled;
  }

  /** @inheritDoc IActivity.isSettled */
  @computed
  get isSettled() {
    return (this.isCompleted || this.isError);
  }

  /** @inheritDoc IActivity.isAborted */
  @computed
  get isAborted() {
    return this.error?.code === ErrorCode.Aborted;
  }

  /**
   * Sets the status of the activity delegate to {@link ActivityStatus.Started}
   * Returns an error if the activity cannot be set to `Started`.
   */
  @action
  setStarted() {
    this.status = ActivityStatus.Started;
  }
  
  /**
   * Sets the result on the activity delegate and sets the appropriate
   * {@link ActivtyStatus.Error} or {@link ActivtyStatus.Completed} status
   * depending on the provided result.
   */
  @action
  setResult(res: Result<T>): Result<T> {
    this.result = res;
    const [val, err] = res;

    if (err)
      this.status = ActivityStatus.Error;
    else
      this.status = ActivityStatus.Completed;

    this.promiseRelay.resolve(res);
    return res;
  }

  /**
   * Sets the status of the activity delegate to {@link ActivityStatus.Completed}
   * and sets the result based on the provided value.
   */
  @action
  setCompleted(val: T): Result<T> {
    trace(this, { activity: this });
    return this.setResult([val]);
  }

  /**
   * Sets the status of the activity delegate to {@link ActivityStatus.Error}
   * and sets the result based on the provided error.
   */
  @action
  setError(err: Error | ErrorCode): Result<T> {
    const errObj = toError(err);
    error(this, errObj);
    return this.setResult([null, errObj]);
  }
}