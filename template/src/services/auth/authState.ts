import { AuthContext } from './authContext';
import { AuthPermit } from './authPermit';
import { AuthStateType } from './authSchema';

type Props = {
  type: AuthStateType.Authorized;
  context: AuthContext;
} | {
  type: AuthStateType.Unauthorized;
} | {
  type: AuthStateType.Authorizing;
  transientPermit: AuthPermit | null;
}

/**
 * Describes the authorization state that the application
 * is in to at any moment in time.
 * If the type is set to {@link AuthStateType.Authorized} then an {@link AuthContext}
 * must also be provided.
 * If the type is set to {@link AuthStateType.Authorizing} then an {@link AuthPermit}
 * must be provided such that is registered as the transient permit, 
 * for auth flows to use if needed.
 * If the type is set to  {@link AuthStateType.Unauthorized} 
 * then no other references are permitted.
 */
export class AuthState {

  constructor(props: Props) {
    const { type } = props;

    this.type = props.type;
    this.context = null;
    this.transientPermit = null;

    switch (type) {
      case AuthStateType.Unauthorized:
        break;

      case AuthStateType.Authorized:
        this.context = props.context;
        break;

      case AuthStateType.Authorizing:
        this.transientPermit = props.transientPermit ?? null;
        break;
    }
  }

  /**
   * The authorization type of the current state.
   */
  readonly type: AuthStateType;

  /**
   * The reference to the {@link AuthContext} if {@link AuthState.type}
   * is set to {@link AuthStateType.Authorized}.
   */
  readonly context: AuthContext | null;

  /**
   * The reference to the transient {@link AuthPermit} if {@link AuthState.type}
   * is set to {@link AuthStateType.Authorizing}.
   */
  readonly transientPermit: AuthPermit | null;

  /**
   * Returns `true` if {@link AuthState.type} is set to 
   * {@link AuthStateType.Unauthorized}.
   */
  get isUnauthorized() {
    return this.type === AuthStateType.Unauthorized;
  }

  /**
   * Returns `true` if {@link AuthState.type} is set to 
   * {@link AuthStateType.Authorized}.
   */
  get isAuthorized() {
    return this.type === AuthStateType.Authorized;
  }

  /**
   * Returns `true` if {@link AuthState.type} is set to 
   * {@link AuthStateType.Authorizing}.
   */
  get isAuthorizing() {
    return this.type === AuthStateType.Authorizing;
  }

  /**
   * Returns `true` if either {@link AuthState.isAuthorized} 
   * or {@link AuthState.isUnauthorized} is `true`.
   */
  get isStable() {
    return (
      this.isAuthorized ||
      this.isUnauthorized);
  }

  /**
   * Returns `true` if {@link AuthState.isAuthorizing} is `true`.
   */
  get isTransient() {
    return this.isAuthorizing;
  }
}