import { AbortableParams, AsyncResult } from '../../core/types';
import { AuthContext } from '../auth/authContext';
import { AuthStateType } from '../auth/authSchema';
import { AuthState } from '../auth/authState';

/**
 * Represents an object that can be implemented by various auth providers 
 * which can then be passed an used by API requests to handle authorization.
 */
export interface IApiRequestAuthMediator {

  /**
   * Gets the current `AuthState` of the mediated environment.
   */
  getState(): AuthState;

  /**
   * Gets the current `AuthContext` of the mediated context, or `null` if
   * the current environment is not an `Authorized` one.
   */
  getContext(): AuthContext | null;

  /**
   * Returns a Promise that will resolve once a new `AuthState` is pushed to
   * the current mediated environment.
   * @param typeFilter  A filter which will make the Promise resolve only for states 
   *                    that match the specified {@link AuthStateType}
   */
  waitForNextState(typeFilter?: Iterable<AuthStateType> | null): Promise<AuthState>;

  /**
   * Requests to the mediator to trigger a reauthorization and returns the new `AuthState`
   * once the operation is completed. The new `AuthState` can have any type, including
   * the `Unauthorized` one, if the reauthorization failed.
   */
  reauthorize(): AsyncResult<AuthState>;
}

/**
 * Represents an object that can be implemented by various network providers 
 * which can then be passed an used by API requests to handle network connectivity.
 */
export interface IApiRequestNetworkMediator {

}

/**
 * @interface
 * The resolved parameters that will be passed to the {@link ApiRequestExecutor}
 * once it is executed by the API request functions.
 */
export type ApiRequestExecutorParams =
  AbortableParams & {
    /** 
     * The resolved token that should be sent to the server, 
     * or `null` if the current context is an `Anonymous` one.
     */
    token: string | null;
  };

export type ApiRequestExecutor<T> =
  (params: ApiRequestExecutorParams) => AsyncResult<T>;