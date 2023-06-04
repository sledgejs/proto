import { nanoid } from 'nanoid';
import { Config } from '../config/config';
import { ServiceLoader } from '../services/serviceLoader';
import { Service, ServiceName } from '../services/serviceSchema';
import { Node } from './node';

import { ApiService } from '../services/api/apiService';
import { AuthService } from '../services/auth/authService';
import { RoutingService } from '../services/routing/routingService';
import { EventService } from '../services/event/eventService';

import { DevAnnotatedObject } from '../dev/devSchema';
import { initDev } from '../dev';
import { trace } from '../dev';
import { VendorService } from '../services/vendor/vendorService';
import { UiService } from '../services/ui/uiService';
import { ComponentService } from '../services/component/componentService';
import { NotificationService } from '../services/notification/notificationService';

type Props = {

}

export type KernelProps = Props;

export interface Kernel
  extends Node, DevAnnotatedObject { }

export class Kernel
  implements Node, DevAnnotatedObject {

  constructor() {
    // makeObservable(this);

    initDev(this, { typeName: 'Kernel' });
    trace(this);

    this.kernel = this;

    this.apiService = new ApiService(this);
    this.authService = new AuthService(this);
    this.routingService = new RoutingService(this);
    this.eventService = new EventService(this);
    this.uiService = new UiService(this);
    this.componentService = new ComponentService(this);
    this.notificationService = new NotificationService(this);
  }

  readonly id = nanoid();
  readonly kernel: Kernel;

  readonly config = Config;

  readonly serviceLoader = new ServiceLoader(this);

  readonly apiService: ApiService;
  readonly authService: AuthService;
  readonly routingService: RoutingService;
  readonly eventService: EventService;
  readonly uiService: UiService;
  readonly componentService: ComponentService;
  readonly notificationService: NotificationService;

  get vendorService(): VendorService | null {
    return this.getService(ServiceName.Vendor);
  }

  getService<T extends ServiceName>(name: T): Service[T] {
    return this.serviceLoader.get(name);
  }

  loadService<T extends ServiceName>(name: T): Promise<Service[T]> {
    return this.serviceLoader.load(name);
  }

  dispose() {
    trace(this);
  }
}