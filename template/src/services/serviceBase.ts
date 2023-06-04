import { Node } from '../kernel/node';
import type { Kernel } from '../kernel/kernel';
import type { IService, ServiceName } from './serviceSchema';

export abstract class ServiceBase
  extends Node
  implements IService {

  constructor(kernel: Kernel) {
    super(kernel);
  }

  abstract get serviceName(): ServiceName;
}