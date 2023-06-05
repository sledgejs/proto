import { nanoid } from 'nanoid';
import { AuthContextType } from './authSchema';

import type { AuthPermit } from './authPermit';
import type { UserIdentity } from './userIdentity';

/**
 * Contains the properties to use when creating a new {@link AuthContext} instance.
 * - If `type` is {@link AuthContextType.Authenticated} then
 * you also need to provide a `permit` and an `identity`.
 * - Otherwise you only need to provide the {@link AuthContextType.Anonymous} `type`.
 */
export type AuthContextProps = {

  /** The type to set on the new instance. */
  type: AuthContextType.Authenticated;

  /** 
   * The {@link AuthPermit} to set on the new instance
   * if `type` is set to {@link AuthContextType.Authenticated}. 
   */
  permit: AuthPermit;

  /** 
   * The {@link UserIdentity} to set on the new instance
   * if `type` is set to {@link AuthContextType.Authenticated}.
   */
  identity: UserIdentity;

} | {

  /** The type to set on the new instance. */
  type: AuthContextType.Anonymous;
};

type Props = AuthContextProps;

/**
 * Represents a fully authorized state of the application.
 * If the type is set to {@link AuthContextType.Authenticated} then the object 
 * will contain both an {@link AuthPermit} and a {@link UserIdentity}.
 * If the type is set to {@link AuthContextType.Anonymous} then 
 * no additional objects are referenced.
 */
export class AuthContext {

  /**
   * Creates a new instance of the {@link AuthContext} class 
   * using the provided arguments.
   * @param props The properties to set on the new instance.
   */
  constructor(props: Props) {

    this.type = props.type;

    switch (props.type) {
      case AuthContextType.Authenticated:
        this.permit = props.permit;
        this.identity = props.identity;
        break;

      case AuthContextType.Anonymous:
        this.permit = null;
        this.identity = null;
        break;
    }

    Object.freeze(this);
  }

  /**
   * A locally unique identifier for the current instance.
   */
  readonly contextId = nanoid();

  /**
   * The authentication type of the current instance.
   */
  readonly type: AuthContextType;

  /**
   * Reference to the {@link AuthPermit} set on the current instance,
   * or `null` if the context is of the {@link AuthContextType.Anonymous} type.
   */
  readonly permit: AuthPermit | null = null;

  /**
   * Reference to the {@link UserIdentity} set on the current instance,
   * or `null` if the context is of the {@link AuthContextType.Anonymous} type.
   */
  readonly identity: UserIdentity | null = null;

  /**
   * Returns `true` if {@link AuthContext.type} is set to 
   * {@link AuthContextType.Anonymous} and `false` otherwise.
   */
  get isAuthenticated(): boolean {
    return this.type === AuthContextType.Authenticated;
  }

  /**
   * Returns `true` if {@link AuthContext.type} is set to 
   * {@link AuthContextType.Authenticated} and `false` otherwise.
   */
  get isAnonymous(): boolean {
    return this.type === AuthContextType.Anonymous;
  }

  /**
   * Gets the current validity status of the context.
   * If the type is set to {@link AuthContextType.Authenticated} then this returns
   * the validity of the {@link AuthContext.permit}.
   * If the type is set to {@link AuthContextType.Anonymous} then this returns `true`
   * since anonymous context are always valid and never expire.
   */
  get isValid(): boolean {
    switch (this.type) {
      case AuthContextType.Authenticated:
        return this.permit?.isValid ?? false;

      case AuthContextType.Anonymous:
        return true;
    }

    return false;
  }
}