import { AbortableParams } from '../../core/types';
import { ObjectLiteral } from '../../core/types';
import { AsyncResult } from '../../core/types';
import { Error } from '../../errors/error';

export type AuthFlowOptions = AbortableParams;

export interface IAuthFlow {
  
  /** 
   * Runs the flow using the provided arguments.
   */
  run(...args: any[]): AsyncResult<AuthFlowResponse>;

  /** 
   * The qualified name of the flow.
   */
  flowName: AuthFlowName;
}

/**
 * The authentication type of the {@link AuthContext}.
 */
export enum AuthContextType {

  /**
   * Indicates that the user is authenticated, a {@link UserIdentity} has
   * been successfully obtained and it is set on the {@link AuthContext.identity} field.
   * An authenticated `AuthContext` is required for private routes.
   */
  Authenticated = 'Authenticated',

  /**
   * Indicates that the user is not authenticated, and no {@link UserIdentity} exists.
   * For public routes an {@link AuthContext} is required but it can have the anonymous type,
   * if no authentication happened.
   */
  Anonymous = 'Anonymous'
}

/**
 * The current authorization state of the application,
 * to be used on the {@link AuthState} object.
 */
export enum AuthStateType {

  /**
   * Indicates that the user is authorized and an {@link AuthContext} exists,
   * regardless of its type. 
   * For accessing private routes the user must be authorized using an
   * {@link AuthContextType.Authenticated} `AuthContext`.
   * For accessing public routes the user can be authorized with either type of `AuthContext`.
   */
  Authorized = 'Authorized',

  /**
   * Indicates that the user is unauthorized and no {@link AuthContext} exists.
   * The application should be in this state while the user is viewing Auth routes,
   * in order to login, register, recover password, etc.
   * For public pages the user should still be authorized using an 
   * {@link AuthContextType.Anonymous} `AuthContext`.
   */
  Unauthorized = 'Unauthorized',

  /**
   * Indicates that the application is in the process of authorizing the user.
   * This does not guarantee that the authorization will succeed.
   * During this state, once an {@link AuthPermit} is obtained, it will be set 
   * on the {@link AuthState.transientPermit} field.
   * The application will be in this state while the user is authenticating using
   * login or reauthorization flows.
   */
  Authorizing = 'Authorizing',
}

/** 
 * Qualified name for all authentication flows in the application.
 */
export enum AuthFlowName {
  AuthRoute = 'AuthRoute',
  PrivateRoute = 'PrivateRoute',
  PublicRoute = 'PublicRoute',
  Login = 'Login',
  Logout = 'Logout',
  RefreshContext = 'RefreshContext'
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