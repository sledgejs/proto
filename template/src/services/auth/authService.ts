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


  @observable initialFlow: IAuthFlow | null = null;
  @computed get initialFlowName(): string | null {
    return this.initialFlow?.flowName ?? null;
  }

  @observable currentFlow: IAuthFlow | null = null;
  @computed get currentFlowName(): string | null {
    return this.currentFlow?.flowName ?? null;
  }

  @computed get canRunFlow(): boolean {
    return !this.currentFlow;
  }
  
  @action
  enterFlow(flow: IAuthFlow) {
    trace(this, { flow });

    if (!this.initialFlow)
      this.initialFlow = flow;

    this.currentFlow = flow;
  }

  @action
  exitFlow() {
    trace(this);

    this.currentFlow = null;
  }
}