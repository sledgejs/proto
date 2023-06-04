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

export abstract class BaseTask<T = DefaultTaskType>
  extends Node
  implements ITask<T> {

  constructor(kernel: Kernel, props: Props = {}) {
    super(kernel);
    makeObservable(this);

    this.delegate = new TaskDelegate<T>({
      abortSignal: props.abortSignal
    });
  }

  readonly taskId = nanoid();

  readonly delegate: TaskDelegate<T>;

  readonly label: string | null = null;

  get abortedError(): Error { 
    return this.delegate.abortedError; 
  }

  get abortSignal(): AbortSignal {
    return this.delegate.abortSignal;
  }

  get promise(): AsyncResult<T> {
    return this.delegate.promise;
  }

  @computed
  get status(): TaskStatus {
    return this.delegate.status;
  }

  @computed
  get result(): Result<T> | null {
    return this.delegate.result;
  }

  @computed get value(): T | null {
    return this.delegate.value;
  }

  @computed get error(): Error | null {
    return this.delegate.error;
  }

  @computed get isIdle() { return this.delegate.isIdle; }
  @computed get isRunning() { return this.delegate.isRunning; }
  @computed get isCompleted() { return this.delegate.isCompleted; }
  @computed get isError() { return this.delegate.isError; }
  @computed get isSettled() { return this.delegate.isSettled; }
  @computed get isAborted() { return this.delegate.isAborted; }

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