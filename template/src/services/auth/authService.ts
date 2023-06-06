import { action, computed, makeObservable, observable } from 'mobx';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';
import { AuthStateManager } from './authStateManager';
import { AuthContext } from './authContext';
import { AuthPermit } from './authPermit';
import { UserIdentity } from './userIdentity';
import type { Kernel } from '../../kernel/kernel';
import type { IAuthFlow } from './authSchema';
import { trace } from '../../dev';

/**
 * Service which manages authentication and authorization for the application.
 */
export class AuthService
  extends ServiceBase {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);
  }

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.Auth;

  /**
   * Reference to the object which manages the authentication and authorization state.
   */
  readonly stateManager = new AuthStateManager(this.kernel);

  /**
   * Gets the current `AuthContext` if there is one set on `AuthStateManager`, or `null` otherwise.
   */
  @computed get context(): AuthContext | null {
    return this.stateManager.context;
  }

  /**
   * Gets the current `AuthPermit` if there is one set on `AuthStateManager`, or `null` otherwise.
   */
  @computed get permit(): AuthPermit | null {
    return this.context?.permit ?? null;
  }

  /**
   * Gets the current `UserIdentity` if there is one set on `AuthStateManager`, or `null` otherwise.
   */
  @computed get identity(): UserIdentity | null {
    return this.context?.identity ?? null;
  }

  /**
   * A reference to the first auth flow that was run on this service.
   */
  @observable initialFlow: IAuthFlow | null = null;

  /**
   * A reference to the current auth flow that is currently running on this service.
   */
  @observable currentFlow: IAuthFlow | null = null;

  /**
   * Returns `true` if a flow can be currently started on this service.
   */
  @computed get canRunFlow(): boolean {
    return !this.currentFlow;
  }
  
  /**
   * Registers a flow into this service, marks it as running and
   * registers a reference to it.
   */
  @action
  enterFlow(flow: IAuthFlow) {
    trace(this, { flow });

    if (!this.initialFlow)
      this.initialFlow = flow;

    this.currentFlow = flow;
  }

  /**
   * Marks the current flow that was registered on this service as settled
   * and removes the reference to it.
   */
  @action
  exitFlow() {
    trace(this);

    this.currentFlow = null;
  }
}