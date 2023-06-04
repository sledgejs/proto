import { action, computed, makeObservable, observable } from 'mobx';
import { FormEvent } from 'react';
import { initDev } from '../../dev';
import { trace } from '../../dev';
import { Kernel } from '../../kernel/kernel';
import { useKernel } from '../../kernel/kernelHooks';
import { Node } from '../../kernel/node';
import { useModel, ModelOptions } from '../componentHooks';
import { InputState } from './inputState';
import { FormAction, FormImperativeHook } from './formSchema';
import type { FormHook, FormHookObject, FormProps } from './formSchema';
import { ObservableRef } from '../../core/observableRef';
import { unifyFormHooks } from './formUtils';

type Props = {
  id?: string | null;
  modelRef?: ObservableRef<FormState> | null;
}

export class FormState
  extends Node {

  constructor(kernel: Kernel, props?: Props) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'green' });
    trace(this);

    this.initialId = props?.id ?? null;
  }

  readonly initialId: string | null;

  @observable.shallow elementProps: FormProps = {};

  @computed get formId(): string | null {
    return this.elementProps.id ?? this.initialId;
  }

  @computed get hooks(): FormHook[] {
    return this.elementProps.hooks ?? [];
  }

  @computed get imperativeHooks(): FormImperativeHook[] {
    return this.elementProps.imperativeHooks ?? [];
  }

  @observable parentForm: FormState | null = null;

  readonly childForms = observable.array<FormState>();
  readonly childInputs = observable.array<InputState>();

  @observable lastAction: FormAction = FormAction.Init;

  @computed get hooksResult(): FormHookObject {
    return this.computeHooksResult();
  }

  @computed get error() {
    return this.hooksResult.error ?? null;
  }

  @computed get isDisabled(): boolean {

    return (
      this.elementProps.disabled ||
      this.hooksResult.disabled ||
      false);
  }


  @computed get hasErrorInputs() {
    return this.childInputs.some(input => !!input.error);
  }

  @computed get hasVisibleErrorMessageInputs() {
    return this.childInputs.some(input => !!input.error && input.showMessage);
  }

  @computed get hasVisibleErrorStatusInputs() {
    return this.childInputs.some(input => !!input.error && input.showStatus);
  }

  @computed get hasVisibleErrorInputs() {
    return (
      this.hasVisibleErrorMessageInputs ||
      this.hasVisibleErrorStatusInputs);
  }

  @computed get hasSubmittedInputs() {
    return this.childInputs.some(input => input.isSubmitted);
  }

  @computed get hasChangedOnceInputs() {
    return this.childInputs.some(input => !!input.isChangedOnce);
  }

  @computed get hasNonSubmittedInputs() {
    return this.childInputs.some(input => !input.isSubmitted);
  }

  @action
  handleSubmit = (evt: FormEvent) => {
    evt.preventDefault();

    this.childInputs.forEach(input =>
      input.handleSubmit(evt));
    this.childForms.forEach(form =>
      form.handleSubmit(evt));

    if (this.hasErrorInputs) {
      this.elementProps.onInvalid?.(evt, this);
      return;
    }

    this.elementProps.onSubmit?.(evt, this);
  }

  @action
  handleInvalid = (evt: FormEvent) => {
    evt.preventDefault();
    this.elementProps.onInvalid?.(evt, this);
  }

  @action
  handleReset = (evt: FormEvent) => {
    this.elementProps.onReset?.(evt, this);
  }

  @action
  handleChange = (evt: FormEvent) => {
    this.elementProps.onChange?.(evt, this);
  }

  private computeHooksResult(): FormHookObject {
    const mergedHook = unifyFormHooks(this.hooks);
    return mergedHook(this, this.lastAction) ?? {};
  }

  @action
  handleParentChange = (parent: FormState | null) => {
    this.parentForm = parent;
  }

  @action
  attachForm(form: FormState) {
    this.childForms.push(form);
  }

  @action
  detachForm(form: FormState) {
    this.childForms.remove(form);
  }

  @action
  attachInput(input: InputState) {
    this.childInputs.push(input);
  }

  @action
  detachInput(input: InputState) {
    this.childInputs.remove(input);
  }

  @action
  elementPropsChanged(props: FormProps) {
    this.elementProps = props;
  }

  @action 
  reset(){
    this.childInputs.forEach((input: InputState) => input.reset());
  }
}

export function useFormState(props?: Props, modelOptions: ModelOptions<FormState> = {}): FormState {
  const kernel = useKernel();
  return useModel(() => new FormState(kernel, props), modelOptions);
}