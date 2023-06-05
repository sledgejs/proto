import { action, makeObservable, observable } from 'mobx';
import type { Kernel } from '../../kernel/kernel';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

/**
 * Service which manages low-level network related tasks.
 */
export class NetworkService
  extends ServiceBase {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    this.init();
  }

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.Network;

  /**
   * The current network status of the web page.
   */
  @observable isOnline = true;

  /**
   * Registers global event listeners to monitor
   * for changes in the network status.
   */
  init() {

    window.addEventListener('offline',
      this.handleOffline);
    window.addEventListener('online',
      this.handleOnline);
  }

  /**
   * Cleans up all resources used by this service.
   */
  dispose() {
    window.removeEventListener('offline',
      this.handleOffline);
    window.removeEventListener('online',
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