import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

/**
 * Service which manages creation, registration and handling 
 * of tasks in the application.
 * 
 * @remark
 * Not implemented yet.
 */
export class TaskService
  extends ServiceBase {

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.Task;
}