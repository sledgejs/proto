import { AsyncResult } from '../../core/types';
import { AuthContext } from '../auth/authContext';
import { AuthStateType } from '../auth/authSchema';
import { AuthState } from '../auth/authState';

export interface IApiRequestAuthMediator {
  getState(): AuthState;
  getContext(): AuthContext | null;
  waitForNextState(typeFilter?: Iterable<AuthStateType> | null): Promise<AuthState>;
  reauthorize(): AsyncResult<AuthState>;
}

export interface IApiRequestNetworkMediator {
  
}

export type ApiRequestExecutorParams = {
  token: string | null;
  abortSignal: AbortSignal | null;
}

export type ApiRequestExecutor<T> =
  (params: ApiRequestExecutorParams) => AsyncResult<T>;