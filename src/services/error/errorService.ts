import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

/**
 * Service which manages errors which occur inside the application.
 * 
 * @remark
 * Not implemented yet.
 */
export class ErrorService
  extends ServiceBase {

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.Error;
}