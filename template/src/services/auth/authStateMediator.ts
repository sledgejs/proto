import { Error } from '../../errors/error';
import { Node } from '../../kernel/node';
import { AuthFlowResponseType, AuthStateType } from './authSchema';

import type { AsyncResult } from '../../core/types';
import type { Kernel } from '../../kernel/kernel';
import type { IApiRequestAuthMediator } from '../api/apiInteropSchema';
import type { AuthContext } from './authContext';
import type { AuthState } from './authState';
import type { AuthStateManager } from './authStateManager';

import { initDev, trace } from '../../dev';

/**
 * Implementation of {@link IApiRequestAuthMediator} that uses 
 * {@link AuthService} and the objects associated with it.
 */
export class AuthStateMediator
  extends Node
  implements IApiRequestAuthMediator {

  /**
   * Creates a new instance of the {@link AuthStateMediator} class.
   */
  constructor(kernel: Kernel) {
    super(kernel);

    initDev(this);
    trace(this);
  }

  private get stateManager(): AuthStateManager {
    return this.kernel.authService.stateManager;
  }

  /**
   * Gets the current {@link AuthContext} of the application.
   */
  getContext(): AuthContext | null {
    return this.stateManager.getContext();
  }

  /**
   * Gets the current {@link AuthState} of the application.
   */
  getState(): AuthState {
    return this.stateManager.state;
  }

  /**
   * Runs a {@link RefreshContextFlow} and depending on the result,
   * returns the corresponding {@link AuthState}.
   * If the flow succeeds then an {@link AuthStateType.Authorized} {@link AuthState} is returned.
   * Otherwise a redirect will happen to the appropriate auth page.
   */
  async reauthorize(): AsyncResult<AuthState> {

    trace(this);

    const { authService, routingService } = this.kernel;
    if (!authService.canRunFlow)
      return [null, new Error('InternalError', { message: `Cannot run the RefreshPermitFlow because there is another flow in progress.` })];

    const { RefreshContextFlow } = await import('./flows/refreshContextFlow');
    const flow = new RefreshContextFlow(this.kernel);
    const [res, err] = await flow.run();

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

  /**
   * @inheritDoc AuthStateManager.waitForNextState
   */
  async waitForNextState(typeFilter: Iterable<AuthStateType> | null = null): Promise<AuthState> {
    const nextState = await this.stateManager.waitForNextState(typeFilter);
    return nextState;
  }
}