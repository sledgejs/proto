import { action, makeObservable, observable } from 'mobx';
import type { Kernel } from '../../kernel/kernel';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

/**
 * Manages low-level network related tasks.
 */
export class NetworkService
  extends ServiceBase {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    this.init();
  }

  readonly serviceName = ServiceName.Network;

  @observable isOnline = true;

  init() {

    window.addEventListener('offline',
      this.handleOffline);
    window.addEventListener('online',
      this.handleOnline);
  }

  @action
  private handleOnline = () => {
    this.isOnline = true;
  }

  @action
  private handleOffline = () => {
    this.isOnline = false;
  }
}