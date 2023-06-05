import { Node } from '../kernel/node';
import type { Kernel } from '../kernel/kernel';
import type { IService, ServiceName } from './serviceSchema';

export abstract class ServiceBase
  extends Node
  implements IService {

  constructor(kernel: Kernel) {
    super(kernel);
  }

  /**
   * The qualified service name.
   */
  abstract get serviceName(): ServiceName;
}