import { action, computed, makeObservable, observable } from 'mobx';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';
import { AuthStateManager } from './authStateManager';
import { AuthContext } from './authContext';
import { AuthPermit } from './authPermit';
import { UserIdentity } from './userIdentity';
import { Kernel } from '../../kernel/kernel';
import type { IAuthFlow } from './authSchema';
import { trace } from '../../dev';

export class AuthService
  extends ServiceBase {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);
  }

  readonly serviceName = ServiceName.Auth;

  readonly stateManager = new AuthStateManager(this.kernel);

  @computed get context(): AuthContext | null {
    return this.stateManager.context;
  }

  @computed get permit(): AuthPermit | null {
    return this.context?.permit ?? null;
  }

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

  @computed get shouldWaitForNextContext(): boolean {
    const { currentFlow } = this;
    if (currentFlow)
      return true;
    return !this.initialFlow;
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