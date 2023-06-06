import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

/**
 * Service which manages logging, error reporting and other
 * diagnostics related tasks.
 * 
 * @remark
 * Not implemented yet.
 */
export class DiagnosticsService
  extends ServiceBase {

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.Diagnostics;
}