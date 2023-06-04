# Tasks
Most asynchronous operations which need to be monitored, can be aborted and must return either a value or an error should be put inside a Task.
Task execution and resource management should be opaque to the external objects. Using React's strict mode as a use case, if a page is being loaded through a task, then unmounted (causing the Task to be aborted and deleted from the page) and then re-mounted (causing another Task to be created and ran), the 2 tasks will run independent of each other and they should manage their resources and abort logic accordingly.

## Task shape
A Task has the following core properties:

```ts
interface ITask<T = true> {

  taskId: string;
  label: string | null;
  status: TaskStatus;
  error: Error | null;
  promise: AsyncResult<T>;
  run(): AsyncResult<T>;
}
```

In practice, all tasks inherit from the `BaseTask` class which has the following structure:

```ts

interface BaseTask<T = DefaultTaskType>
  extends Node
  implements ITask<T> {

  readonly taskId: string;
  readonly label: string | null;

  abortSignal: AbortSignal;
  promise: AsyncResult<T>;
  status: TaskStatus;
  result: Result<T> | null;
  value: T | null;
  error: Error | null;
  isIdle: boolean;
  isRunning: boolean;
  isCompleted: boolean;
  isError: boolean;
  isSettled: boolean;
  isAborted: boolean;

  async run(): AsyncResult<T>;
}
```

A Task always has a status which is one of the following:

```ts
enum TaskStatus {
  Idle = 'Idle',
  Running = 'Running',
  Completed = 'Completed',
  Error = 'Error'
}
```

## Aborting a Task
As with the other abortable resources in the app, tasks can only be aborted if an `AbortSignal` is provided in their constructor.