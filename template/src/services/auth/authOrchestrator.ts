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

export class AuthOrchestrator
  extends Node {

  constructor(kernel: Kernel, props: Props = {}) {
    super(kernel);
    makeObservable(this);

    _initDev(this);
    _trace(this);

    this.abortSignal = props.abortSignal ?? null;
  }

  readonly abortSignal: AbortSignal | null = null;

  @observable permit: AuthPermit | null = null;
  @observable identity: UserIdentity | null = null;
  @observable context: AuthContext | null = null;

  @observable error: Error | null = null;
  @observable.shallow response: AuthFlowResponse | null = null;

  private readonly promiseRelay = new PromiseRelay<Result<AuthFlowResponse>>();
  get promise(): AsyncResult<AuthFlowResponse> {
    return this.promiseRelay.promise;
  }

  get stateManager() {
    return this.kernel.authService.stateManager;
  }

  flow: IAuthFlow | null = null;

  @action
  start(flow: IAuthFlow): Result<true> {
    _trace(this, { flow });

    this.flow = flow;
    this.kernel.authService.enterFlow(flow);
    return [true];
  }

  /**
   * Returns the context which is currently set on the service.
   */
  getActiveContext(): AuthContext | null {
    return this.stateManager.context;
  }

  isActiveContextValid(): boolean {
    return this.getActiveContext()?.isValid ?? false;
  }

  // #region Permit methods
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
  setPermit(permit: AuthPermit): Result<AuthPermit> {
    this.permit = permit;
    return [permit];
  }

  @action
  private handlePermitError(err: Error): Result<AuthPermit> {
    this.permit = null;
    return [null, err];
  }
  // #endregion

  // #region Identity methods

  /**
   * Executes a `getCurrentUser` query using the token from the current AuthPermit,
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
  setIdentity(identity: UserIdentity): Result<UserIdentity> {
    this.identity = identity;
    return [identity];
  }

  @action
  private handleIdentityError(err: Error): Result<UserIdentity> {
    this.identity = null;
    return [null, err];
  }
  // #endregion

  // #region Context Methods

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

  createAnonymousContext(): Result<AuthContext> {
    const context = new AuthContext({
      type: AuthContextType.Anonymous
    });

    this.setContext(context);
    return [context!];
  }
  // #endregion

  // #region Auth0 Flow Methods
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

  async logout(): AsyncResult<true> {
    _trace(this);

    removeLocal('auth.username');
    removeLocal('auth.token');
    removeLocal('auth.expires');

    this.invalidate();

    return [true];
  }
  // #endregion

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

  pushAuthorizingState(): Result<true> {
    _trace(this);

    const { stateManager: state, permit } = this;

    state.pushAuthorizingState(permit);

    return [true];
  }

  pushUnauthorizedState(): Result<true> {
    _trace(this);

    const { stateManager: state } = this;

    state.pushUnauthorizedState();

    return [true];
  }

  @action
  invalidate(): Result<boolean> {
    const { stateManager: state } = this;
    state.pushUnauthorizedState();

    this.permit = null;
    this.identity = null;
    this.context = null;

    return [true];
  }

  @action
  setContext(context: AuthContext): Result<AuthContext> {

    this.permit = context.permit;
    this.identity = context.identity;
    this.context = context;

    return [context];
  }

  // #endregion

  /**
   * Loads the current AuthPermit from the AuthService into the orchestrator.
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

  reload(): Result<true> {
    window.location.reload();
    return [true];
  }


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

  @action
  setSuccess() {
    return this.setResponse(AuthFlowResponseType.Success);
  }

  @action
  setAuthorized() {
    return this.setResponse(AuthFlowResponseType.Authorized);
  }

  @action
  setRedirectAfterLogout() {
    return this.setResponse(AuthFlowResponseType.RedirectAfterLogout);
  }

  @action
  setRedirectToLoginPage(props?: Partial<AuthFlowResponse>) {
    return this.setResponse(AuthFlowResponseType.RedirectToLoginPage, props);
  }

  @action
  setRedirectToLastPrivateRoute() {
    return this.setResponse(AuthFlowResponseType.RedirectToLastContentRoute);
  }

  @action
  setPassThroughAuthRoute(props?: Partial<AuthFlowResponse>): Result<AuthFlowResponse> {
    return this.setResponse(AuthFlowResponseType.PassThroughAuthRoute, props);
  }

  @action
  setPassThroughPrivateRoute(props?: Partial<AuthFlowResponse>): Result<AuthFlowResponse> {
    return this.setResponse(AuthFlowResponseType.PassThroughPrivateRoute, props);
  }

  @action
  setPassThroughPublicRoute(props?: Partial<AuthFlowResponse>): Result<AuthFlowResponse> {
    return this.setResponse(AuthFlowResponseType.PassThroughPublicRoute, props);
  }

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