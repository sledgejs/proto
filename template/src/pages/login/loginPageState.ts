import { action, computed, makeObservable, observable } from 'mobx';
import { FormEvent } from 'react';
import { ObservableRef } from '../../core/observableRef';
import { FormState } from '../../components/form/formState';
import { disableFormOnSubmit, forwardFormError, mergeFormHooks } from '../../components/form/formValidationHooks';
import { InputState } from '../../components/form/inputState';
import { forwardInputError, required } from '../../components/form/inputValidationHooks';
import { initDev, trace } from '../../dev';
import { ErrorCode } from '../../errors/errorCode';
import { Kernel } from '../../kernel/kernel';
import type { AsyncResult, MaybeProps } from '../../core/types';
import type { FormHook } from '../../components/form/formSchema';
import type { InputHook, InputHookObject } from '../../components/form/inputSchema';
import { assert } from '../../core/assert';
import type { AuthFlowResponse } from '../../services/auth/authSchema';
import type { LoginInput } from '../../services/auth/authInputSchema';
import { isValidLoginInput } from '../../services/auth/authUtils';
import { LoginSubmitTask } from './loginSubmitTask';
import { BasePageState } from '../basePageState';

export const ForwardErrorParams: InputHookObject = {
  showStatus: true
}

export class LoginPageState
  extends BasePageState {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'blue' });
    trace(this);
  }

  readonly loadTask = null;

  @observable submitTask: LoginSubmitTask | null = null;
  
  @computed get flowResponse(): AuthFlowResponse | null {
    return this.submitTask?.response ?? null;
  }

  @computed get isSubmitting() {
    return this.submitTask?.delegate.isRunning ?? false;
  }

  @computed get submitError() {
    return this.submitTask?.delegate.error ?? null;
  }

  // #region Email
  readonly emailInputRef = new ObservableRef<InputState | null>(null);

  readonly emailForwardedErrorCodes: ErrorCode[] = [
    ErrorCode['Login.WrongCredentials']
  ];

  readonly emailInputHooks: InputHook[] = [
    forwardInputError(() => this.submitError, this.emailForwardedErrorCodes, ForwardErrorParams),
    required('Please enter your email address')
  ];

  @computed get email(): string | null {
    return this.emailInputRef.current?.value ?? null;
  }
  // #endregion

  // #region Password
  readonly passwordInputRef = new ObservableRef<InputState | null>(null);

  readonly passwordForwardedErrorCodes: ErrorCode[] = [
    ErrorCode['Login.WrongCredentials']
  ];

  readonly passwordInputHooks: InputHook[] = [
    forwardInputError(() => this.submitError, this.passwordForwardedErrorCodes, ForwardErrorParams),
    required('Please enter your password')
  ];

  @computed get password(): string | null {
    return this.passwordInputRef.current?.value ?? null;
  }
  // #endregion

  // #region Form
  readonly formRef = new ObservableRef<FormState | null>(null);

  readonly formHooks: FormHook[] = [
    mergeFormHooks([
      forwardFormError(() => this.submitError),
      disableFormOnSubmit(() => this.isSubmitting)
    ])
  ];

  @computed get form(): FormState | null {
    return this.formRef.current ?? null;
  }
  // #endregion

  async attached() {
    trace(this);
  }

  detached() {
    trace(this);

    this.submitTask = null;
  }

  @action
  handleSubmit = (evt: FormEvent) => {
    trace(this, { event: evt });
    this.submit();
  }

  @action
  handleReset = (evt: FormEvent) => {
    trace(this, { event: evt });
  }

  @action
  handleInvalid = (evt: FormEvent) => {
    trace(this, { event: evt });
  }

  @action
  handleChange = (evt: FormEvent) => {
    trace(this, { event: evt });
    this.submitTask = null;
  }

  @action
  async submit(): AsyncResult<AuthFlowResponse> {

    const input = this.getInput();
    const submitTask = new LoginSubmitTask(this.kernel, {
      input
    });

    this.submitTask = submitTask;

    return submitTask.run();
  }
  
  private getInput(): LoginInput {

    const input: MaybeProps<LoginInput> = {
      username: this.email,
      password: this.password
    };

    assert(isValidLoginInput(input),
      `Expected a valid LoginInput.`);

    return input as LoginInput;
  }
}