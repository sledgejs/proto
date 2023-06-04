import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

export class DiagnosticsService
  extends ServiceBase {

  readonly serviceName = ServiceName.Diagnostics;
}