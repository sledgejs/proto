import type { Error } from '../errors/error';
import type { AsyncResult, Result } from '../core/types';
import type { Node } from '../kernel/node';

export type DefaultTaskValueType = true;

/**
 * Describes the status of a {@link ITask} at a particular moment in time.
 */
export enum TaskStatus {
  /**
   * The task has not been started yet.
   */
  Idle = 'Idle',

  /**
   * The task has been started but it hasn't settled yet.
   */
  Running = 'Running',
  
  /**
   * The task completed successfully, no error has occurred and a value has been set.
   */
  Completed = 'Completed',
  
  /**
   * The task failed with an unrecoverable error.
   */
  Error = 'Error'
}

/**
 * For tasks that derive from the {@link BaseTask} class, this represents the function
 * that will be invoked by the task and contains the actual logic of the task.
 * @typeParam T The type of the value returned by the task.
 */
export type TaskExecutor<T = DefaultTaskValueType> =
  () => AsyncResult<T>;

/**
 * The interface for all Task implementations.
 * @typeParam T The type of the value returned by the task.
 */
export interface ITask<T = DefaultTaskValueType>
  extends Node {

  /**
   * Gets a locally unique identifier for the task.
   */
  taskId: string;

  /**
   * Gets the user-defined label for the task.
   */
  label: string | null;

  /**
   * Gets the abort signal that was provided when the instance was created.
   * If an abort signal was provided in the constructor, it will be returned.
   * Otherwise `null` will be returned and the task will not be abortable.
   */
  abortSignal: AbortSignal | null;

  /**
   * Gets a promise that resolves with the result of the task, once the task settles.
   * @remark The `Promise` never rejects, since the error will be contained in the {@link Result | result} if it occurs.
   */
  promise: AsyncResult<T>;

  /**
   * Gets the status of the task.
   */
  status: TaskStatus;

  /**
   * Gets the result the task settled with.
   */
  result: Result<T> | null;

  /**
   * Gets the value part of the result, or `null` if the Task hasn't settled or it failed with an error.
   */
  value: T | null;

  /**
   * Gets the error part of the result, or `null` if the Task hasn't settled or it completed successfully.
   */
  error: Error | null;

  /** 
   * Returns `true` if {@link ITask.status} is set to {@link TaskStatus.Idle}. 
   */
  isIdle: boolean;
  
  /** 
   * Returns `true` if {@link ITask.status} is set to {@link TaskStatus.Running}. 
   */
  isRunning: boolean;
  
  /** 
   * Returns `true` if {@link ITask.status} is set to {@link TaskStatus.Completed}. 
   */
  isCompleted: boolean;
  
  /** 
   * Returns `true` if {@link ITask.status} is set to {@link TaskStatus.Error}. 
   */
  isError: boolean;
  
  /** 
   * Returns `true` if either {@link ITask.isCompleted} or {@link ITask.isError} is `true`.
   */
  isSettled: boolean;
  
  /** 
   * Returns `true` if the Task has settled with an error and the error itself has the `Aborted` code.
   */
  isAborted: boolean;

  /**
   * Starts the task.
   * @returns A Promise that gets resolved with the task result once the task settles.
   */
  run(): AsyncResult<T>;
}