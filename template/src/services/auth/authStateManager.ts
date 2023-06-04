import { computed, makeObservable, observable } from 'mobx';
import { initDev, trace } from '../../dev';
import { Error } from '../../errors/error';
import { Node } from '../../kernel/node';
import { Kernel } from '../../kernel/kernel';
import { AuthContext } from './authContext';
import { AsyncIterableRelay } from '../../core/async/asyncIterableRelay';
import { AuthPermit } from './authPermit';
import { AuthState } from './authState';
import { AuthStateType } from './authSchema';

/**
 * Exposes methods for setting and querying the authorization state which is kept in localStorage.
 * The purpose of this object is to keep the minimally required information in order
 * to prevent unnecessary requests to Auth0 in order to check if the user is still 
 * authenticated or not, or if a token needs to be refreshed or not.
 * The only type of information allowed to be stored is token expiry timestamps 
 * and simple flags regarding the current session status.
 * Keeping actual tokens in localStorage should be avoided.
 */
export class AuthStateManager
  extends Node {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'blueviolet' });
    trace(this);
  }

  @observable state = new AuthState({ type: AuthStateType.Unauthorized });

  @computed get context(): AuthContext | null {
    return this.state.context;
  }

  private readonly stateIterableRelay = new AsyncIterableRelay<AuthState>();
  get stateIterable(): AsyncIterable<AuthState> {
    return this.stateIterableRelay.iterable;
  }

  /**
   * Returns the current context as it is, without checking if it's valid 
   * or syncing it with the storage. 
   * Use this when you want to check the current state of the context yourself.
   */
  getContext() {
    trace(this, `getContext()`, this.context);
    return this.context;
  }

  pushAuthorizedState(context: AuthContext) {
    this.state = new AuthState({
      type: AuthStateType.Authorized,
      context
    });
  }

  pushUnauthorizedState() {
    this.state = new AuthState({
      type: AuthStateType.Unauthorized
    });
  }

  pushAuthorizingState(transientPermit: AuthPermit | null = null) {
    this.state = new AuthState({
      type: AuthStateType.Authorizing,
      transientPermit
    });
  }

  async waitForNextState(typeFilter: Iterable<AuthStateType> | null = null) {
    trace(this);

    for await (const state of this.stateIterable) {

      if (typeFilter) {
        const typesSet = new Set(...typeFilter);
        if (!typesSet.has(state.type))
          continue;
      }

      trace(this, `Iteration and awaiting resolved`, state);
      return state;
    }

    throw new Error('InternalError', { message: `The state iterable was finished which should never happen.` });
  }
}