import { action, computed, makeObservable } from 'mobx';
import { nanoid } from 'nanoid';
import { Error } from '../errors/error';
import { Kernel } from '../kernel/kernel';
import { Node } from '../kernel/node';
import { TaskDelegate } from './taskDelegate';
import { ITask, TaskStatus } from './taskSchema';
import type { AsyncResult, Result } from '../core/types';
import type { AbortableProps } from '../core/types';

export type DefaultTaskType = true;

type Props = AbortableProps;

export type BaseTaskProps = Props;

/**
 * Base implementation for an {@link ITask} which can be
 * used by all task implementations in the application.
 */
export abstract class BaseTask<T = DefaultTaskType>
  extends Node
  implements ITask<T> {

  constructor(kernel: Kernel, props: Props = {}) {
    super(kernel);
    makeObservable(this);

    this.delegate = new TaskDelegate<T>(this.kernel, props);
  }

  /**
   * Delegate which manages all the logic for the task.
   */
  readonly delegate: TaskDelegate<T>;

  /** @inheritDoc ITask.taskId */
  readonly taskId = nanoid();

  /** @inheritDoc ITask.label */
  readonly label: string | null = null;

  /** @inheritDoc ITask.abortSignal */
  get abortSignal(): AbortSignal | null {
    return this.delegate.abortSignal;
  }

  /** @inheritDoc ITask.promise */
  get promise(): AsyncResult<T> {
    return this.delegate.promise;
  }

  /** @inheritDoc ITask.status */
  @computed
  get status(): TaskStatus {
    return this.delegate.status;
  }

  /** @inheritDoc ITask.result */
  @computed
  get result(): Result<T> | null {
    return this.delegate.result;
  }

  /** @inheritDoc ITask.value */
  @computed 
  get value(): T | null {
    return this.delegate.value;
  }

  /** @inheritDoc ITask.error */
  @computed 
  get error(): Error | null {
    return this.delegate.error;
  }

  /** @inheritDoc ITask.isIdle */
  @computed 
  get isIdle() { 
    return this.delegate.isIdle; 
  }
  
  /** @inheritDoc ITask.isRunning */
  @computed 
  get isRunning() { 
    return this.delegate.isRunning; 
  }
  
  /** @inheritDoc ITask.isCompleted */
  @computed 
  get isCompleted() { 
    return this.delegate.isCompleted; 
  }
  
  /** @inheritDoc ITask.isError */
  @computed 
  get isError() { 
    return this.delegate.isError; 
  }
  
  /** @inheritDoc ITask.isSettled */
  @computed 
  get isSettled() { 
    return this.delegate.isSettled; 
  }
  
  /** @inheritDoc ITask.isAborted */
  @computed 
  get isAborted() { 
    return this.delegate.isAborted; 
  }

  /** @inheritDoc ITask.run */
  @action
  async run(): AsyncResult<T> {

    this.delegate.setRunning();

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