import type { AsyncResult, Result } from '../core/types';
import type { Error } from '../errors/error';

export type DefaultActivityValueType = true;

/**
 * Describes the status of a {@link IActivity} at a particular moment in time.
 */
export enum ActivityStatus {
  /**
   * The activity has not been started yet using {@link ITask.run}.
   */
  Idle = 'Idle',
  
  /**
   * The activity has been started but it hasn't settled yet.
   */
  Started = 'Started',
  
  /**
   * The activity completed successfully, no error has occurred and a value has been set.
   */
  Completed = 'Completed',
  
  /**
   * The activity failed with an unrecoverable error.
   */
  Error = 'Error',
  
  /**
   * The activity was canceled by the user.
   */
  Canceled = 'Canceled'
}

/**
 * The interface for all activity implementations.
 * 
 * @typeParam T       The type of the value returned by the activity.
 * @typeParam TModel  The type of the object which owns this activity.
 */
export interface IActivity<T, TModel = any> {
  
  /**
   * Gets a locally unique identifier for the activity.
   */
  activityId: string;

  /**
   * Gets the user-defined label for the activity.
   */
  label: string | null;

  /** 
   * The model which owns this activity.
   */
  model: TModel;

  /**
   * Gets the abort signal the activity has been initialized with.
   * If an abort signal was provided in the constructor, it will be returned.
   * Otherwise `null` will be returned and the activity will not be abortable.
   */
  abortSignal: AbortSignal | null;
  
  /**
   * Gets a promise that resolves with the result of the activity, once the activity settles.
   * @remark 
   * The `Promise` never rejects, since the error will be contained in the {@link Result | result} if it occurs.
   */
  promise: AsyncResult<T>;

  /**
   * Gets the status of the activity.
   */
  status: ActivityStatus;

  /**
   * Gets the result the activity settled with.
   */
  result: Result<T> | null;

  /**
   * Gets the value part of the result, or `null` if the activity hasn't settled or it failed with an error.
   */
  value: T | null;

  /**
   * Gets the error part of the result, or `null` if the activity hasn't settled or it completed successfully.
   */
  error: Error | null;

  /** 
   * Returns `true` if {@link IActivity.status} is set to {@link ActivityStatus.Idle}. 
   */
  isIdle: boolean;
  
  /** 
   * Returns `true` if {@link IActivity.status} is set to {@link ActivityStatus.Started}. 
   */
  isStarted: boolean;
  
  /** 
   * Returns `true` if {@link IActivity.status} is set to {@link ActivityStatus.Completed}. 
   */
  isCompleted: boolean;
  
  /** 
   * Returns `true` if {@link IActivity.status} is set to {@link ActivityStatus.Error}. 
   */
  isError: boolean;
  
  /** 
   * Returns `true` if {@link IActivity.status} is set to {@link ActivityStatus.Canceled}.
   */
  isCanceled: boolean;

  /** 
   * Returns `true` if either {@link IActivity.isCompleted} or {@link IActivity.isError} is `true`.
   */
  isSettled: boolean;
  
  /** 
   * Returns `true` if the activity has settled with an error and the error itself has the `Aborted` code.
   */
  isAborted: boolean;

  /**
   * Starts the activity.
   * @returns A Promise that gets resolved with the activity result once the activity settles.
   */
  start(): AsyncResult<T>;
}