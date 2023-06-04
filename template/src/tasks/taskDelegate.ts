import { action, computed, makeObservable, observable } from 'mobx';
import { error, trace } from '../dev';
import { Error } from '../errors/error';
import { ErrorCode } from '../errors/errorCode';
import { ErrorGroup } from '../errors/errorGroup';
import { TaskStatus } from './taskSchema';
import type { AsyncResult, Result } from '../core/types';
import { DevAnnotatedObject } from '../dev/devSchema';
import { PromiseRelay } from '../core/async/promiseRelay';
import { toError } from '../errors/errorUtils';

type Props = {
  abortSignal?: AbortSignal | null;
}

export interface TaskDelegate<T = true>
  extends DevAnnotatedObject { }

export class TaskDelegate<T = true>
  implements DevAnnotatedObject {

  constructor(props: Props = {}) {
    makeObservable(this);

    this.externalAbortSignal = props.abortSignal ?? null;
  }
 
  readonly abortedError = new Error(ErrorCode.Aborted);

  readonly abortController = new AbortController();
  get defaultAbortSignal() {
    return this.abortController.signal;
  }

  readonly externalAbortSignal: AbortSignal | null = null;

  get abortSignal() {
    return (
      this.externalAbortSignal ??
      this.abortController.signal);
  }

  readonly promiseRelay = new PromiseRelay<Result<T>>();
  get promise(): AsyncResult<T> {
    return this.promiseRelay.promise;
  }

  @observable status: TaskStatus = TaskStatus.Idle;
  @observable.shallow result: Result<T> | null = null;

  @computed get value(): T | null {
    return this.result?.[0] ?? null;
  }

  @computed get error(): Error | null {
    return this.result?.[1] ?? null;
  }

  @computed get isIdle() {
    return this.status === TaskStatus.Idle;
  }

  @computed get isRunning() {
    return this.status === TaskStatus.Running;
  }

  @computed get isCompleted() {
    return this.status === TaskStatus.Completed;
  }

  @computed get isError() {
    return this.status === TaskStatus.Error;
  }

  @computed get isSettled() {
    return (this.isCompleted || this.isError);
  }

  @computed get isAborted() {
    return this.error?.code === ErrorCode.Aborted;
  }

  async run(): AsyncResult<T> {
    throw new Error(ErrorCode.NotCallable);
  }

  @action
  setRunning(): Result<unknown> {

    if (this.isRunning)
      return [null, new Error(ErrorCode.TaskAlreadyRunning)];

    this.status = TaskStatus.Running;
    this.result = null;

    return [true];
  }

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

  @action
  setCompleted(val: T): Result<T> {
    trace(this, { task: this });
    return this.setResult([val]);
  }

  @action
  setError(err: Error | ErrorCode): Result<T> {
    const errObj = toError(err);
    error(this, errObj);
    return this.setResult([null, errObj]);
  }

  @action
  setAborted(): Result<T> {
    trace(this);
    return this.setError(this.abortedError);
  }

  @action
  handleSubTaskErrors(errs: Error[]) {
    const errGroup = new ErrorGroup(errs);
    return this.setError(errGroup);
  }
}