import { AsyncResult } from '../../core/types';
import { initDev, trace } from '../../dev';
import { Kernel } from '../../kernel/kernel';
import { Node } from '../../kernel/node';
import { AuthContext } from './authContext';
import { Error } from '../../errors/error';
import { AuthFlowResponseType, AuthStateType } from './authSchema';
import { IApiRequestAuthMediator } from '../api/apiInteropSchema';
import { AuthState } from './authState';
import { AuthStateManager } from './authStateManager';

export class AuthStateMediator
  extends Node
  implements IApiRequestAuthMediator {

  constructor(kernel: Kernel) {
    super(kernel);
    
    initDev(this);
    trace(this);
  }

  private get stateManager(): AuthStateManager {
    return this.kernel.authService.stateManager;
  }

  getContext(): AuthContext | null {
    return this.stateManager.getContext();
  }

  getState(): AuthState {
    return this.stateManager.state;
  }

  async reauthorize(): AsyncResult<AuthState> {

    trace(this);

    return this.refreshContext();
  }

  async waitForNextState(typeFilter: Iterable<AuthStateType> | null = null): Promise<AuthState> {
    const nextState = await this.stateManager.waitForNextState(typeFilter);
    return nextState;
  }

  async refreshContext(): AsyncResult<AuthState> {

    trace(this, `refreshContext()`);

    const { authService, routingService } = this.kernel;
    if (!authService.canRunFlow)
      return [null, new Error('InternalError', { message: `Cannot run the RefreshPermitFlow because there is another flow in progress.` })];

    const [res, err] = await this.runRefreshContextFlow();
    if (err)
      return [null, err];

    const responseType = res?.responseType
    const { state } = authService.stateManager;
    const { context } = state;

    trace(this, `'responseType' of RefreshContextFlow is:`, responseType);

    switch (responseType) {
      case AuthFlowResponseType.Authorized:

        if (
          !context ||
          !context.isValid ||
          !context.isAuthenticated)
          return [null, new Error('InternalError', { message: `Expected the AuthContext returned by RefreshContextFlow to be valid and of the Authenticated type.` })];

        // nothing to do, context will be returned
        trace(this, `Context has been refreshed successfully`, context);

        return [state];

      case AuthFlowResponseType.RedirectToLoginPage:
      case AuthFlowResponseType.RedirectToLastContentRoute:
        trace(this, `Context failed to refresh and user will be redirected`);

        routingService.executeAuthFlowResponse(res!);
        break;
    }

    // context is valid and authenticated
    return [null, new Error('InternalError', { message: `Your session has expired. You should be redirected to the login page.` })];
  }

  async runRefreshContextFlow() {
    const { RefreshContextFlow } = await import('./flows/refreshContextFlow');
    const flow = new RefreshContextFlow(this.kernel);
    return flow.run();
  }
}