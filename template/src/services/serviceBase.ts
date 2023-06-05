import { Node } from '../kernel/node';
import type { Kernel } from '../kernel/kernel';
import type { IService, ServiceName } from './serviceSchema';

/**
 * Base class for all services.
 */
export abstract class ServiceBase
  extends Node
  implements IService {

  /**
   * Base constructor for {@link ServiceBase} which should be
   * invoked by derived classes.
   */
  constructor(kernel: Kernel) {
    super(kernel);
  }

  /**
   * The qualified service name.
   */
  abstract get serviceName(): ServiceName;
}