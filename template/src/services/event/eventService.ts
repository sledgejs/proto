import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

export class EventService
  extends ServiceBase {

  readonly serviceName = ServiceName.Event;
}