import { action, computed, makeObservable, observable } from 'mobx';
import { error, trace } from '../dev';
import { Error } from '../errors/error';
import { ErrorCode } from '../errors/errorCode';
import { TaskStatus } from './taskSchema';
import type { AbortableProps, AsyncResult, Result } from '../core/types';
import { DevAnnotatedObject } from '../dev/devSchema';
import { PromiseRelay } from '../core/async/promiseRelay';
import { toError } from '../errors/errorUtils';
import { Kernel } from '../kernel/kernel';
import { Node } from '../kernel/node';

type Props = AbortableProps;

export interface TaskDelegate<T = true>
  extends DevAnnotatedObject { }

/**
 * Delegate object which handles all task related logic.
 * Ideally this should only be used by {@link BaseTask} but this class
 * exists in order to allow for other types of tasks to be easily implemented.
 */
export class TaskDelegate<T = true>
  extends Node {

  constructor(kernel: Kernel, props: Props = {}) {
    super(kernel);
    makeObservable(this);

    this.abortSignal = props.abortSignal ?? null;
  }

  /** @inheritDoc ITask.abortSignal */
  readonly abortSignal: AbortSignal | null = null;

  private readonly promiseRelay = new PromiseRelay<Result<T>>();

  /** @inheritDoc ITask.promise */
  get promise(): AsyncResult<T> {
    return this.promiseRelay.promise;
  }

  /** @inheritDoc ITask.status */
  @observable status: TaskStatus = TaskStatus.Idle;

  /** @inheritDoc ITask.result */
  @observable.shallow result: Result<T> | null = null;

  /** @inheritDoc ITask.value */
  @computed
  get value(): T | null {
    return this.result?.[0] ?? null;
  }

  /** @inheritDoc ITask.error */
  @computed
  get error(): Error | null {
    return this.result?.[1] ?? null;
  }

  /** @inheritDoc ITask.isIdle */
  @computed
  get isIdle() {
    return this.status === TaskStatus.Idle;
  }

  /** @inheritDoc ITask.isRunning */
  @computed
  get isRunning() {
    return this.status === TaskStatus.Running;
  }

  /** @inheritDoc ITask.isCompleted */
  @computed
  get isCompleted() {
    return this.status === TaskStatus.Completed;
  }

  /** @inheritDoc ITask.isError */
  @computed
  get isError() {
    return this.status === TaskStatus.Error;
  }

  /** @inheritDoc ITask.isSettled */
  @computed
  get isSettled() {
    return (this.isCompleted || this.isError);
  }

  /** @inheritDoc ITask.isAborted */
  @computed
  get isAborted() {
    return this.error?.code === ErrorCode.Aborted;
  }

  /**
   * Sets the status of the task delegate to {@link TaskStatus.Running}
   * Returns an error if the task cannot be set to running.
   */
  @action
  setRunning(): Result<unknown> {

    if (this.isRunning)
      return [null, new Error(ErrorCode.TaskAlreadyRunning)];

    this.status = TaskStatus.Running;
    this.result = null;

    return [true];
  }

  /**
   * Sets the result on the task delegate and sets the appropriate
   * {@link TaskStatus.Error} or {@link TaskStatus.Completed} status
   * depending on the provided result.
   */
  @action
  setResult(res: Result<T>): Result<T> {
    this.result = res;
    const [val, err] = res;

    if (err)
      this.status = TaskStatus.Error;
    else
      this.status = TaskStatus.Completed;

    this.promiseRelay.resolve(res);
    return res;
  }

  /**
   * Sets the status of the task delegate to {@link TaskStatus.Completed}
   * and sets the result based on the provided value.
   */
  @action
  setCompleted(val: T): Result<T> {
    trace(this, { task: this });
    return this.setResult([val]);
  }

  /**
   * Sets the status of the task delegate to {@link TaskStatus.Error}
   * and sets the result based on the provided error.
   */
  @action
  setError(err: Error | ErrorCode): Result<T> {
    const errObj = toError(err);
    error(this, errObj);
    return this.setResult([null, errObj]);
  }
}