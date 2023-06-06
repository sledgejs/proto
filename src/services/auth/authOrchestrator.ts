import { action, makeObservable, observable } from 'mobx';
import { Kernel } from '../../kernel/kernel';
import { Node } from '../../kernel/node';
import { AuthPermit } from './authPermit';
import { AuthContext } from './authContext';
import { UserIdentity } from './userIdentity';
import { batch, BatchFuncList } from '../../core/async/batch';
import { AbortableProps } from '../../core/types';
import { AuthFlowName, AuthFlowResponse, AuthFlowResponseType, AuthContextType } from './authSchema';
import { runFetchIdentityStep } from './steps/fetchIdentityStep';
import { Error } from '../../errors/error';
import { assert, assertDefined, assertNullOrUndefined } from '../../core/assert';
import { isFiniteNumber, isNonEmptyString } from '../../core/typeUtils';
import { ErrorCode } from '../../errors/errorCode';
import { PromiseRelay } from '../../core/async/promiseRelay';

import type { AsyncResult, Result } from '../../core/types';
import type { IAuthFlow } from './authSchema';
import type { LoginInput } from './authInputSchema';

import { _trace, _initDev, trace } from '../../dev';
import { getLocal, removeLocal } from '../../core/storage/localStorageUtils';
import { getNowSeconds } from '../../core/dateTimeUtils';
import sign from 'jwt-encode';

type Props = AbortableProps;

/**
 * Enables composition of authentication flows from discrete steps.
 */
export class AuthOrchestrator
  extends Node {

  constructor(kernel: Kernel, props: Props = {}) {
    super(kernel);
    makeObservable(this);

    _initDev(this);
    _trace(this);

    this.abortSignal = props.abortSignal ?? null;
  }

  /**
   * The abort signal that was provided when the instance was created.
   */
  readonly abortSignal: AbortSignal | null = null;

  /**
   * The local auth permit if it was successfully set from a step.
   */
  @observable permit: AuthPermit | null = null;
  
  /**
   * The local user identity if it was successfully set from a step.
   */
  @observable identity: UserIdentity | null = null;
  
  /**
   * The local auth context if it was successfully set from a step.
   */
  @observable context: AuthContext | null = null;

  /**
   * The local error if the last step failed.
   */
  @observable error: Error | null = null;
  
  /**
   * The local auth flow response if the flow completed successfully with a response.
   */
  @observable.shallow response: AuthFlowResponse | null = null;

  private readonly promiseRelay = new PromiseRelay<Result<AuthFlowResponse>>();

  /**
   * Returns a Promise that will resolve once the flow completes.
   */
  get promise(): AsyncResult<AuthFlowResponse> {
    return this.promiseRelay.promise;
  }

  private get stateManager() {
    return this.kernel.authService.stateManager;
  }

  /**
   * Reference to the flow which owns this instance of the orchestrator.
   */
  flow: IAuthFlow | null = null;

  /**
   * Marks the flow controlled by this orchestrator as started and sets
   * the reference to the flow on this instance.
   */
  @action
  start(flow: IAuthFlow): Result<true> {
    _trace(this, { flow });

    this.flow = flow;
    this.kernel.authService.enterFlow(flow);
    return [true];
  }

  /**
   * Returns the context which is currently set on the {@link AuthStateManager}.
   */
  getActiveContext(): AuthContext | null {
    return this.stateManager.context;
  }

  /**
   * Returns `true` if the context set on the {@link AuthStateManager} is valid.
   */
  isActiveContextValid(): boolean {
    return this.getActiveContext()?.isValid ?? false;
  }

  /**
   * Refreshes the session using the backing auth provider
   * and sets a new permit on the orchestrator if the step succeeds.
   * 
   * @remark
   * In this boilerplate the implementation is a stub, 
   * since there is no backing auth provider.
   */
  async refreshPermit(): AsyncResult<AuthPermit> {
    _trace(this);

    const exToken = getLocal('auth.token');
    const exUsername = getLocal('auth.username');
    const exExpires = getLocal<number>('auth.expires', true);

    if (
      !isNonEmptyString(exToken) ||
      !isFiniteNumber(exExpires) ||
      !isNonEmptyString(exUsername))
      return this.handlePermitError(new Error(ErrorCode['Auth.ExistingSessionNotFound']));

    if (exExpires < getNowSeconds())
      return this.handlePermitError(new Error(ErrorCode['Auth.ExistingSessionExpired']));

    const iat = getNowSeconds();
    const exp = iat + 3600;
    const secret = 'secret';

    const tokenPayload = {
      sub: exUsername,
      exp: exp,
      iat: iat
    };

    const token = sign(tokenPayload, secret);

    const [permit, err] = AuthPermit.create({
      token,
      tokenPayload
    });

    if (err)
      return this.handlePermitError(err);

    return this.setPermit(permit!);
  }

  @action
  private setPermit(permit: AuthPermit): Result<AuthPermit> {
    this.permit = permit;
    return [permit];
  }

  @action
  private handlePermitError(err: Error): Result<AuthPermit> {
    this.permit = null;
    return [null, err];
  }

  /**
   * Executes a query using the token from the current AuthPermit,
   * returns and sets the new UserIdentity on the current orchestrator instance.
   */
  async fetchIdentity(): AsyncResult<UserIdentity> {
    _trace(this);

    const { permit } = this;

    assertDefined(permit, `FetchIdentityStep requires a permit.`);

    const [identity, err] = await runFetchIdentityStep({
      orchestrator: this,
      permit: permit
    });

    if (err) {
      _trace(this, `Step failed with error: `, err);
      return this.handleIdentityError(err);
    }

    _trace(this, `Step completed with identity object: `, identity);
    return this.setIdentity(identity!);
  }


  @action
  private setIdentity(identity: UserIdentity): Result<UserIdentity> {
    this.identity = identity;
    return [identity];
  }

  @action
  private handleIdentityError(err: Error): Result<UserIdentity> {
    this.identity = null;
    return [null, err];
  }

  /**
   * Creates a new authenticated context using the existing permit and identity
   * and sets it on this orchestrator.
   * Emits an error if either requirement (permit or identity) is missing.
   */
  createAuthenticatedContext(): Result<AuthContext> {

    const { permit, identity } = this;

    assertDefined(permit,
      `Creating an AuthContext requires a valid AuthPermit set on the 'permit' field.`);
    assertDefined(identity,
      `Creating an AuthContext requires a valid UserIdentity set on the 'identity' field.`);

    assert(permit.isValid,
      `Creating an AuthContext requires the AuthPermit to be valid.`);

    const context = new AuthContext({
      type: AuthContextType.Authenticated,
      permit,
      identity: identity,
      // TODO: add business
    });

    this.setContext(context);

    return [context!];
  }

  /**
   * Creates an anonymous context and sets it on this orchestrator.
   */
  createAnonymousContext(): Result<AuthContext> {
    const context = new AuthContext({
      type: AuthContextType.Anonymous
    });

    this.setContext(context);
    return [context!];
  }

  @action
  private setContext(context: AuthContext): Result<AuthContext> {

    this.permit = context.permit;
    this.identity = context.identity;
    this.context = context;

    return [context];
  }

  /**
   * Signs in the user with the provided credentials using the backing auth provider.
   * 
   * @remark
   * In this boilerplate the implementation is a stub, 
   * since there is no backing auth provider.
   */
  async login(input: LoginInput): AsyncResult<AuthPermit> {
    _trace(this, { input });

    const iat = getNowSeconds();
    const exp = iat + 3600;
    const secret = 'secret';

    const tokenPayload = {
      sub: input.username,
      exp: exp,
      iat: iat
    };

    const token = sign(tokenPayload, secret);

    const [permit, err] = AuthPermit.create({
      token,
      tokenPayload
    });

    if (err)
      return this.handlePermitError(err);

    return this.setPermit(permit!);
  }

  /**
   * Signs out the user using the backing auth provider.
   * 
   * @remark
   * In this boilerplate the implementation is a stub, 
   * since there is no backing auth provider.
   */
  async logout(): AsyncResult<true> {
    _trace(this);

    removeLocal('auth.username');
    removeLocal('auth.token');
    removeLocal('auth.expires');

    this.invalidate();

    return [true];
  }

  /**
   * Pushes a new authorized state on the state manager using the existing context.
   * The context must exist and must be valid, otherwise an error is emitted.
   */
  @action
  pushAuthorizedState(): Result<true> {
    _trace(this);

    const { stateManager: state, context } = this;

    assertDefined(context,
      `'pushAuthorizedState' requires a valid AuthContext to be set.`);

    assert(context.isValid,
      `'pushAuthorizedState' requires a valid AuthContext to be set.`);

    state.pushAuthorizedState(context);

    assert(!!state.context?.isValid,
      `The context was not properly set.`);

    return [true];
  }

  /**
   * Pushes a new authorizing state on the state manager.
   */
  pushAuthorizingState(): Result<true> {
    _trace(this);

    const { stateManager: state, permit } = this;

    state.pushAuthorizingState(permit);

    return [true];
  }

  /**
   * Pushes a new unauthorized state on the state manager.
   */
  pushUnauthorizedState(): Result<true> {
    _trace(this);

    const { stateManager: state } = this;

    state.pushUnauthorizedState();

    return [true];
  }

  /**
   * Invalidates the auth state across the application, pushing
   * a new unauthorized state and clearing all data on the orchestrator.
   */
  @action
  invalidate(): Result<boolean> {
    const { stateManager: state } = this;
    state.pushUnauthorizedState();

    this.permit = null;
    this.identity = null;
    this.context = null;

    return [true];
  }

  /**
   * Loads the current permit from the state manager into this orchestrator.
   * If no permit exists, an Error is returned.
   */
  @action
  loadContext(): Result<AuthContext> {
    const { context } = this.stateManager;
    if (!context)
      return [null, new Error(ErrorCode['InternalError'], { message: `There is no AuthContext set on the current auth state.` })];

    this.setContext(context);
    return [context];
  }

  /**
   * Sets the final result on the orchestrator as an error result
   * using the provided error.
   */
  @action
  setError(err: Error | ErrorCode): Result<AuthFlowResponse> {

    assert(!this.response && !this.error,
      `You can set the response only once.`);

    if (isNonEmptyString(err))
      err = new Error(err);

    this.pushUnauthorizedState();
    this.error = err;

    this.promiseRelay.resolve(
      [null, this.error]);

    return [null, err];
  }

  private setResponse(type: AuthFlowResponseType, props?: Partial<AuthFlowResponse>): Result<AuthFlowResponse> {

    assert(!this.response && !this.error,
      `You can set the response only once.`);

    this.response = {
      responseType: type,
      ...props
    }

    this.promiseRelay.resolve(
      [this.response]);


    trace(this, this.flow?.flowName, type, props);

    this.kernel.authService.exitFlow();
    return [this.response];
  }

  /**
   * Sets the final response of the orchestrator as a response of the
   * {@link AuthFlowResponseType.Success} type.
   */
  @action
  setSuccess() {
    return this.setResponse(AuthFlowResponseType.Success);
  }

  /**
   * Sets the final response of the orchestrator as a response of the
   * {@link AuthFlowResponseType.Authorized} type.
   */
  @action
  setAuthorized() {
    return this.setResponse(AuthFlowResponseType.Authorized);
  }

  /**
   * Sets the final response of the orchestrator as a response of the
   * {@link AuthFlowResponseType.RedirectAfterLogout} type.
   */
  @action
  setRedirectAfterLogout() {
    return this.setResponse(AuthFlowResponseType.RedirectAfterLogout);
  }

  /**
   * Sets the final response of the orchestrator as a response of the
   * {@link AuthFlowResponseType.RedirectToLoginPage} type.
   */
  @action
  setRedirectToLoginPage(props?: Partial<AuthFlowResponse>) {
    return this.setResponse(AuthFlowResponseType.RedirectToLoginPage, props);
  }

  /**
   * Sets the final response of the orchestrator as a response of the
   * {@link AuthFlowResponseType.RedirectToLastContentRoute} type.
   */
  @action
  setRedirectToLastPrivateRoute() {
    return this.setResponse(AuthFlowResponseType.RedirectToLastContentRoute);
  }

  /**
   * Sets the final response of the orchestrator as a response of the
   * {@link AuthFlowResponseType.PassThroughAuthRoute} type.
   */
  @action
  setPassThroughAuthRoute(props?: Partial<AuthFlowResponse>): Result<AuthFlowResponse> {
    return this.setResponse(AuthFlowResponseType.PassThroughAuthRoute, props);
  }

  /**
   * Sets the final response of the orchestrator as a response of the
   * {@link AuthFlowResponseType.PassThroughPrivateRoute} type.
   */
  @action
  setPassThroughPrivateRoute(props?: Partial<AuthFlowResponse>): Result<AuthFlowResponse> {
    return this.setResponse(AuthFlowResponseType.PassThroughPrivateRoute, props);
  }

  /**
   * Sets the final response of the orchestrator as a response of the
   * {@link AuthFlowResponseType.PassThroughPublicRoute} type.
   */
  @action
  setPassThroughPublicRoute(props?: Partial<AuthFlowResponse>): Result<AuthFlowResponse> {
    return this.setResponse(AuthFlowResponseType.PassThroughPublicRoute, props);
  }

  /**
   * Sets the final response of the orchestrator as a response of the
   * {@link AuthFlowResponseType.AwaitRedirect} type.
   */
  @action
  setAwaitRedirect(props?: Partial<AuthFlowResponse>): Result<AuthFlowResponse> {
    return this.setResponse(AuthFlowResponseType.AwaitRedirect, props);
  }

  /**
   * Executes the provided actions serially, but the last action must return an AuthFlowResponse.
   */
  async runBatch(funcs: BatchFuncList<AuthFlowResponse>, errorFuncs?: BatchFuncList<AuthFlowResponse>): AsyncResult<AuthFlowResponse> {
    const [res, err] = await batch(funcs);

    if (err) {
      if (err.code === ErrorCode['Aborted']) {
        this.pushUnauthorizedState();
        return [null, err];
      }

      if (errorFuncs) {
        const [errHandlerRes, errHandlerErr] = await batch(errorFuncs, err);
        assertNullOrUndefined(errHandlerErr,
          `Error handling batch functions cannot return an error.`);

        return [errHandlerRes];
      }

      return this.setError(err);
    }

    return [res];
  }

  /**
   * Pre-composed batch of steps on this orchestrator which
   * authenticates the user with credentials.
   */
  async batchAuthorizeFromLogin(input: LoginInput): AsyncResult<true> {

    return batch([
      () => this.pushAuthorizingState(),
      () => this.login(input),
      () => this.pushAuthorizingState(),
      () => this.fetchIdentity(),
      () => this.createAuthenticatedContext(),
      () => this.pushAuthorizedState()
    ]);
  }

  /**
   * Pre-composed batch of steps on this orchestrator which
   * authenticates the user from an existing session.
   */
  async batchAuthorizeFromSession(): AsyncResult<true> {

    return await batch([
      () => this.pushAuthorizingState(),
      () => this.refreshPermit(),
      () => this.pushAuthorizingState(),
      () => this.fetchIdentity(),
      () => this.createAuthenticatedContext(),
      () => this.pushAuthorizedState(),
    ]);
  }
}