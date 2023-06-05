import { observable } from 'mobx';
import type { AsyncResult } from '../core/types';
import { AsyncLoader } from '../core/async/asyncLoader';
import { Error } from '../errors/error';
import { ErrorCode } from '../errors/errorCode';
import { Kernel } from '../kernel/kernel';
import { IService, Service, ServiceName } from './serviceSchema';

export class ServiceLoader {

  constructor(kernel: Kernel) {
    this.kernel = kernel;
  }

  readonly kernel: Kernel;

  private readonly loaders = observable.map<ServiceName, AsyncLoader>();
  private readonly services = observable.map<ServiceName, any>();

  /**
   * Gets a service by name or `null` if the service is dynamically loaded and hasn't been loaded yet.
   * 
   * For dynamically loaded services use {@link ServiceLoader#load} 
   * if you want to get a `Promise` that resolves when the service has been loaded.
   * 
   * @param name The qualified name of the service you want to load
   * @returns
   */
  get<T extends ServiceName>(name: T): Service[T] | null {
    return this.services.get(name) ?? null;
  }

  async load<T extends ServiceName>(name: T): Promise<Service[T]> {

    const { services } = this;
    if (services.has(name))
      return services.get(name);

    let callback = async (): AsyncResult<IService> => {

      const serviceInst = await (async () => {
        switch (name) {
          case ServiceName.Api:
            const { ApiService } = await import('../services/api/apiService');
            return new ApiService(this.kernel);

          case ServiceName.Auth:
            const { AuthService } = await import('../services/auth/authService');
            return new AuthService(this.kernel);

          case ServiceName.Component:
            const { ComponentService } = await import('../services/component/componentService');
            return new ComponentService(this.kernel);

          case ServiceName.Diagnostics:
            const { DiagnosticsService } = await import('../services/diagnostics/diagnosticsService');
            return new DiagnosticsService(this.kernel);

          case ServiceName.Error:
            const { ErrorService } = await import('../services/error/errorService');
            return new ErrorService(this.kernel);

          case ServiceName.Event:
            const { EventService } = await import('../services/event/eventService');
            return new EventService(this.kernel);

          case ServiceName.Network:
            const { NetworkService } = await import('../services/network/networkService');
            return new NetworkService(this.kernel);

          case ServiceName.Notification:
            const { NotificationService } = await import('../services/notification/notificationService');
            return new NotificationService(this.kernel);

          case ServiceName.Resource:
            const { ResourceService } = await import('../services/resource/resourceService');
            return new ResourceService(this.kernel);

          case ServiceName.Routing:
            const { RoutingService } = await import('../services/routing/routingService');
            return new RoutingService(this.kernel);

          case ServiceName.Task:
            const { TaskService } = await import('../services/task/taskService');
            return new TaskService(this.kernel);

          case ServiceName.UI:
            const { UiService } = await import('../services/ui/uiService');
            return new UiService(this.kernel);

          case ServiceName.Vendor:
            const { VendorService } = await import('../services/vendor/vendorService');
            return new VendorService(this.kernel);
        }
      })();

      if (serviceInst) {
        this.services.set(name, serviceInst);
        return [serviceInst];
      }

      throw new Error(ErrorCode['Services.LoadServiceFailed']);
    }

    const { loaders } = this;
    let loader = loaders.get(name);
    if (!loader) {
      loader = new AsyncLoader(callback);
      this.loaders.set(name, loader);
    }

    const [serviceInst] = await loader.load();
    return serviceInst;
  }
}