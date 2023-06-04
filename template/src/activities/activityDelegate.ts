import { action, makeObservable, observable } from 'mobx';
import { PromiseRelay } from '../core/async/promiseRelay';
import type { AsyncResult, Result } from '../core/types';
import { error, trace } from '../dev';
import { ErrorCode } from '../errors/errorCode';
import { toError } from '../errors/errorUtils';
import { Kernel } from '../kernel/kernel';
import { Node } from '../kernel/node';
import { ActivityStatus } from './activitySchema';

type Props<T, TModel> = {
  model: TModel;
  abortSignal: AbortSignal;
}

/**
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

    this.model = props?.model;

    this.externalAbortSignal = props.abortSignal ?? null;
  }

  readonly abortedError = new Error(ErrorCode.Aborted);

  readonly defaultAbortController = new AbortController();
  get defaultAbortSignal() {
    return this.defaultAbortController.signal;
  }

  readonly externalAbortSignal: AbortSignal | null = null;

  get abortSignal() {
    return this.defaultAbortController.signal;
  }

  readonly promiseRelay = new PromiseRelay<Result<T>>();
  get promise(): AsyncResult<T> {
    return this.promiseRelay.promise;
  }

  readonly model: TModel;

  @observable status: ActivityStatus = ActivityStatus.Idle;
  @observable.shallow result: Result<T> | null = null;

  @action
  setStarted() {
    this.status = ActivityStatus.Started;
  }
  
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
  setCompleted(val: T): Result<T> {
    trace(this, { task: this });
    return this.setResult([val]);
  }
}