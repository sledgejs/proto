import { AbortableParams } from '../../core/types';
import { ObjectLiteral } from '../../core/types';
import { AsyncResult } from '../../core/types';
import { Error } from '../../errors/error';

export type AuthFlowOptions = AbortableParams;

export interface IAuthFlow {
  run(...args: any[]): AsyncResult<AuthFlowResponse>;
  // abort(): void;

  flowName: AuthFlowName;
}

export enum AuthContextType {
  Authenticated = 'Authenticated',
  Anonymous = 'Anonymous'
}

export enum AuthStateType {
  Authorized = 'Authorized',
  Unauthorized = 'Unauthorized',
  Authorizing = 'Authorizing',
}

export enum AuthFlowName {
  AuthRoute = 'AuthRoute',
  PrivateRoute = 'PrivateRoute',
  PublicRoute = 'PublicRoute',
  Login = 'Login',
  Logout = 'Logout',
  RefreshContext = 'RefreshContext'
}

export type AuthRequestOptions = {
  abortSignal?: AbortSignal;
}

export enum AuthFlowResponseType {
  DuplicatedUsername = 'DupliatedUsername',
  AvailableUsername = 'AvailableUsername',

  Success = 'Success',
  Authorized = 'Authorized',
  
  RedirectToLastContentRoute = 'RedirectToLastContentRoute',

  RedirectToLoginPage = 'RedirectToLoginPage',

  RedirectToDefaultPage = 'RedirectToDefaultPage',

  /** 
   * Used after logout to redirect the user either to the last public route
   * if it was the route from which the user logged out, or to the sign in page
   * if the previous route was a private one.
   */
  RedirectAfterLogout = 'RedirectAfterLogout',

  PassThroughAuthRoute = 'PassThroughAuthRoute',

  PassThroughPrivateRoute = 'PassThroughPrivateRoute',

  PassThroughPublicRoute = 'PassThroughPublicRoute',

  AwaitRedirect = 'AwaitRedirect'
}

export type AuthFlowResponse = {
  responseType: AuthFlowResponseType;
  error?: Error | null;
  state?: ObjectLiteral | null;
}

export type AuthTokenPayload = {
  sub: string;
  iat: number;
  exp: number;
}