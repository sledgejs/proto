import { Error } from '../errors/error';
import type { AsyncResult } from '../core/types';
import type { Kernel } from '../kernel/kernel';
import { Node } from '../kernel/node';

export type DefaultTaskValueType = true;

export enum TaskStatus {
  Idle = 'Idle',
  Running = 'Running',
  Completed = 'Completed',
  Error = 'Error'
}

export type TaskExecutor<T = DefaultTaskValueType> =
  () => AsyncResult<T>;

export interface ITaskLike<T = DefaultTaskValueType> {
  run(): AsyncResult<T>;
}

export interface ITask<T = DefaultTaskValueType>
  extends ITaskLike<T>, Node {

  taskId: string;
  label: string | null;
  status: TaskStatus;
  error: Error | null;
  promise: AsyncResult<T>;
  run(): AsyncResult<T>;
}

export interface ITaskMediator<T extends ITask = ITask> {
  tasks: T[];
  deleteTask(task: T): boolean;
  abortTask(task: T): boolean;
  retryTask(task: T): boolean;
}