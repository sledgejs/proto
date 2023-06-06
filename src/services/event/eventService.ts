import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

/**
 * Service which manages event listeners globally.
 * Event listeners in this context refer to implementations
 * over WebSockets, BroadcastChannels, etc.
 * 
 * @remark
 * Not implemented yet.
 */
export class EventService
  extends ServiceBase {

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.Event;
}