import { AbortableParams } from '../../core/types';
import { ObjectLiteral } from '../../core/types';
import { AsyncResult } from '../../core/types';
import { Error } from '../../errors/error';

/**
 * The interface for all auth flow implementations
 */
export interface IAuthFlow {
  
  /**
   * The abort signal that was provided when the instance was created.
   */
  abortSignal: AbortSignal | null;

  /** 
   * The qualified name of the flow.
   */
  flowName: AuthFlowName;
  
  /**
   * Runs the flow using the provided arguments,
   * and returns an auth flow response once it completes.
   */
  run(...args: any[]): AsyncResult<AuthFlowResponse>;
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

/**
 * Qualified type for auth flow responses.
 */
export enum AuthFlowResponseType {
  Success = 'Success',
  Authorized = 'Authorized',
  RedirectToLastContentRoute = 'RedirectToLastContentRoute',
  RedirectToLoginPage = 'RedirectToLoginPage',
  RedirectToDefaultPage = 'RedirectToDefaultPage',
  RedirectAfterLogout = 'RedirectAfterLogout',
  PassThroughAuthRoute = 'PassThroughAuthRoute',
  PassThroughPrivateRoute = 'PassThroughPrivateRoute',
  PassThroughPublicRoute = 'PassThroughPublicRoute',
  AwaitRedirect = 'AwaitRedirect'
}

/**
 * Represents the response returned by an auth flow.
 */
export type AuthFlowResponse = {
  /**
   * The response type which instructs the application what
   * to do with this flow response.
   */
  responseType: AuthFlowResponseType;
  
  /**
   * An additional non-fatal error object that can be a reason
   * for a particular response type.
   * This is not an unrecoverable error, because for that no response
   * would be returned, but rather an actual error result (null, error) would be used.
   * This error for example can be used to display a validation error in the login page
   * if the response type is set to {@link AuthFlowResponseType.RedirectToLoginPage}.
   */ 
  error?: Error | null;
  
  /**
   * Additional routing state to pass between redirects.
   */
  state?: ObjectLiteral | null;
}

export type AuthTokenPayload = {
  sub: string;
  iat: number;
  exp: number;
}