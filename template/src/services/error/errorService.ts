import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

export class ErrorService
  extends ServiceBase {

  readonly serviceName = ServiceName.Error;
}