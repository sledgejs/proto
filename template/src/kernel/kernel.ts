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

/**
 * 
 * The central part of any application is the Kernel. It contains references to the application configuration, loaders, all services and indirectly it might contain references to some or all component states, but this is not required.
 * 
 * All objects in the application except core utilities or some lightweight data objects should keep a reference to the Kernel.
 * This should be done through the {@link Node} base class.
 * 
 * The Kernel serves the following purposes:
 * 
 * - It is a central hub through which all objects can communicate and get references to other objects, either directly or through message passing
 * - It acts as a place to store data and logic not directly related to specific pages or components. This should be done mostly through Services
 * - It can be exposed in testing and development mode for debugging and mocking
 * 
 */
export class Kernel
  implements Node, DevAnnotatedObject {

  constructor() {

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

  /**
   * The locally unique ID of this Kernel instance.
   * Mostly used for debugging and diagnostics.
   */
  readonly kernelId = nanoid();

  /**
   * Self reference such that the Kernel can also implement the Node interface.
   */
  readonly kernel: Kernel;

  /**
   * Reference to the global configuration object of the application.
   */
  readonly config = Config;

  /**
   * Reference to the current {@link ServiceLoader} instance.
   */
  readonly serviceLoader = new ServiceLoader(this);

  /**
   * Reference to the current {@link ApiService} instance.
   * This service is loaded statically.
   */
  readonly apiService: ApiService;
  
  /**
   * Reference to the current {@link AuthService} instance.
   * This service is loaded statically.
   */
  readonly authService: AuthService;

  /**
   * Reference to the current {@link RoutingService} instance.
   * This service is loaded statically.
   */
  readonly routingService: RoutingService;
  
  /**
   * Reference to the current {@link EventService} instance.
   * This service is loaded statically.
   */
  readonly eventService: EventService;
  
  /**
   * Reference to the current {@link UiService} instance.
   * This service is loaded statically.
   */
  readonly uiService: UiService;
  
  /**
   * Reference to the current {@link ComponentService} instance.
   * This service is loaded statically.
   */
  readonly componentService: ComponentService;
  
  /**
   * Reference to the current {@link NotificationService} instance.
   * This service is loaded statically.
   */
  readonly notificationService: NotificationService;

  /**
   * Reference to the current {@link VendorService} instance.
   * This service is loaded dynamically, so it can return `null` if the service
   * has not been loaded yet.
   */
  get vendorService(): VendorService | null {
    return this.getService(ServiceName.Vendor);
  }

  /**
   * Shortcut for {@link ServiceLoader#name}.
   */
  getService<T extends ServiceName>(name: T): Service[T] | null {
    return this.serviceLoader.get(name);
  }

  /**
   * Shortcut for {@link ServiceLoader#name}.
   */
  loadService<T extends ServiceName>(name: T): Promise<Service[T]> {
    return this.serviceLoader.load(name);
  }

  /**
   * Stops all running operations and cleans up all the associated resources.
   * Should not be used in actual applications but might be useful for testing. 
   */
  dispose() {
    trace(this);
  }
}