import { assert, assertDefined } from '../../core/assert';
import { AbortableParams, AsyncResult } from '../../core/types';
import { Error } from '../../errors/error';
import { AuthContextType, AuthStateType } from '../auth/authSchema';
import { AuthState } from '../auth/authState';
import { ApiRequestExecutor, ApiRequestExecutorParams, IApiRequestAuthMediator } from './apiInteropSchema';
import { ApiRequestAuthMode } from './apiSchema';

/**
 * @interface
 * 
 * The parameters to be passed to {@link runApiRequest}.
 * @typeParam T The type of the data returned by the request.
 */
export type RunApiRequestParams<T> = AbortableParams & {

  /**
   * The actual code to execute the request, wait for the response and return the result.
   * @see {@link ApiRequestExecutor} for more details regarding how the executor should be written.
   */
  executor: ApiRequestExecutor<T>;

  /**
   * The authorization mediator to be used for authorization operations.
   * @see {@link IApiRequestAuthMediator} for more details regarding how to implement a mediator.
   */
  mediator: IApiRequestAuthMediator;

  /**
   * The authorization mode to be used.
   * @see {@link ApiRequestAuthMode} for more details regarding how to set this option.
   */
  authMode: ApiRequestAuthMode;
}

type Params<T> = RunApiRequestParams<T>;

/**
 * Runs an API request using the provided parameters.
 * The purpose of this helper is to handle all shared operations regarding authorization,
 * network connectivity, parameters and result decoding, and only delegate to the 
 * {@link RunApiRequestParams#executor} function the actual custom logic of the request.
 * 
 * @param params The parameters to use for the request.
 * @typeParam T The type of the data returned by the request.
 */
export async function runApiRequest<T>(params: Params<T>): AsyncResult<T> {

  const { mediator } = params;

  const currState = mediator.getState();
  switch (currState.type) {
    case AuthStateType.Unauthorized:
      return [null, new Error('Api.NotAuthorized')];

    case AuthStateType.Authorizing:
      return runRequestOnAuthorizingState(params);

    case AuthStateType.Authorized:
      return runRequestOnAuthorizedState(params);
  }
}

async function runRequestOnAuthorizingState<T>(params: Params<T>): AsyncResult<T> {

  const { mediator, authMode } = params;
  const state = mediator.getState();

  assert(state.isAuthorizing,
    `Expected AuthState.type to be Authorized.`);

  if (authMode === ApiRequestAuthMode.Authenticator) {
    return execRequest(params);
  } else {

    const nextState = await mediator.waitForNextState([
      AuthStateType.Authorized,
      AuthStateType.Unauthorized
    ]);

    if (nextState.isUnauthorized)
      return [null, new Error('Api.NotAuthorized')];

    return runRequestOnAuthorizedState(params);
  }
}

async function runRequestOnAuthorizedState<T>(params: Params<T>): AsyncResult<T> {

  const { mediator, authMode } = params;
  const state = mediator.getState();
  const context = mediator.getContext();

  assert(state.isAuthorized,
    `Expected AuthState.type to be Authorized.`);

  assertDefined(context,
    `Expected an AuthContext at this point.`);

  switch (authMode) {

    case ApiRequestAuthMode.Public:
      return execRequest(params);

    case ApiRequestAuthMode.Private:
      switch (context?.type) {
        case AuthContextType.Anonymous:
          // this should not happen
          return [null, new Error('Api.NotAuthorized')];

        case AuthContextType.Authenticated:

          // run request with retry
          const [res, err] = await execRequest(params);
          if (!err)
            return [res];

          if (err.code !== 'Api.ProviderNotAuthorized')
            return [null, err];

          const [reauthState, reauthErr] = await mediator.reauthorize();
          if (reauthErr)
            return [null, reauthErr];

          if (!reauthState.isAuthorized)
            return [null, new Error('Api.NotAuthorized')];

          const reauthCtx = reauthState.context;

          assertDefined(reauthCtx);

          if (reauthCtx.isAnonymous)
            return [null, new Error('Api.NotAuthorized')];

          const [retryRes, retryErr] = await execRequest(params);
          if (retryErr)
            return [null, retryErr];

          return [retryRes];

      }

    case ApiRequestAuthMode.Authenticator:

      let state = mediator.getState();

      switch (state.type) {
        case AuthStateType.Authorizing:
          const { transientPermit } = state;

          assertDefined(transientPermit,
            `PrivateAuthenticator requests are only allowed when the AuthState has a type of 'Authenticating' ` +
            `and there is a 'transientPermit' set.`);

          const [res, err] = await execRequest(params);
          if (err)
            return [null, err];

          return [res];
      }

      return [null, new Error('InvalidState')];
  }
}

async function execRequest<T>({ executor: func, mediator, abortSignal }: Params<T>): AsyncResult<T> {

  try {

    const state = mediator.getState();
    const token = getTokenFromAuthState(state);

    const params: ApiRequestExecutorParams = {
      abortSignal: abortSignal ?? null,
      token
    }

    return await func(params);

  } catch (err) {
    return [null, new Error('Api.GraphQlError', { source: err })];
  }
}

function getTokenFromAuthState(state: AuthState): string | null {
  if (state.isAuthorizing)
    return state.transientPermit?.token ?? null;

  if (state.isAuthorized)
    return state.context?.permit?.token ?? null;

  return null;
}