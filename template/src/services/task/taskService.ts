import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

export class TaskService
  extends ServiceBase {

  readonly serviceName = ServiceName.Task;
}