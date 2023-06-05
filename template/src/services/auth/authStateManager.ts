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
 * Stores the current {@link AuthState} of the application and exposes
 * methods for pushing new states and listening for updates on the state
 * through various means.
 * There should always be an {@link AuthState} set.
 */
export class AuthStateManager
  extends Node {

  /**
   * Creates a new instance of the {@link AuthStateManager} class.
   */
  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'blueviolet' });
    trace(this);

    this.state = new AuthState({ 
      type: AuthStateType.Unauthorized 
    });
  }

  /**
   * The current {@link AuthState} set for the application.
   */
  @observable state: AuthState;

  /**
   * Shortcut for accessing the current {@link AuthContext} 
   * using {@link AuthState.context | AuthState.context}.
   */
  @computed get context(): AuthContext | null {
    return this.state.context;
  }

  private readonly stateIterableRelay = new AsyncIterableRelay<AuthState>();
  
  /**
   * An {@link AsyncIterable} instance which yields a new {@link AuthState} 
   * each time one is pushed to the application. 
   */
  get stateIterable(): AsyncIterable<AuthState> {
    return this.stateIterableRelay.iterable;
  }

  /**
   * Gets the current {@link AuthContext}.
   * Identical to {@link AuthStateManager.context}, but traces the call in development mode.
   */
  getContext() {
    trace(this, this.context);
    return this.context;
  }

  /**
   * Pushes a new {@link AuthState} of the {@link AuthStateType.Authorized} type.
   * @param context The {@link AuthContext} to be set on the new instance.
   */
  pushAuthorizedState(context: AuthContext): void {
    this.state = new AuthState({
      type: AuthStateType.Authorized,
      context
    });
  }

  /**
   * Pushes a new {@link AuthState} of the {@link AuthStateType.Unauthorized} type.
   */
  pushUnauthorizedState(): void {
    this.state = new AuthState({
      type: AuthStateType.Unauthorized
    });
  }

  /**
   * Pushes a new {@link AuthState} of the {@link AuthStateType.Authorizing} type.
   * @param transientPermit The {@link AuthPermit} to be set as the transient permit
   *                        on the new instance, which will probably be used to fetch
   *                        the {@link UserIdentity} from the API. 
   */
  pushAuthorizingState(transientPermit: AuthPermit | null = null): void {
    this.state = new AuthState({
      type: AuthStateType.Authorizing,
      transientPermit
    });
  }

  /**
   * Returns a Promise that will resolve once a new {@link AuthState} 
   * is pushed to the current application.
   * @param typeFilter  A filter which will make the Promise resolve only for states 
   *                    that match the specified {@link AuthStateType}
   */
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