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

/**
 * Backing object for all forms in the application.
 * This class holds state at a very granular level, allowing for very complex
 * validation and styling scenarios which would otherwise be a 
 * lot more complicated using JSX.
 */
export class FormState
  extends Node {

  /**
   * Creates a new instance of {@link FormState} using
   * the provided arguments.
   */
  constructor(kernel: Kernel, props?: Props) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'green' });
    trace(this);

    this.initialId = props?.id ?? null;
  }

  /**
   * The initial form ID for this instance.
   * This refers to the "id" attribute which will appear in DOM. 
   */
  readonly initialId: string | null;

  /**
   * The properties of the form as they have been set from React.
   */
  @observable.shallow elementProps: FormProps = {};

  /**
   * The form "id" attribute to set in the DOM for this form.
   */
  @computed get formId(): string | null {
    return this.elementProps.id ?? this.initialId;
  }

  /**
   * The input array of hooks.
   */
  @computed get hooks(): FormHook[] {
    return this.elementProps.hooks ?? [];
  }

  /**
   * The input array of imperative hooks.
   */
  @computed get imperativeHooks(): FormImperativeHook[] {
    return this.elementProps.imperativeHooks ?? [];
  }

  /** 
   * Reference to the parent {@link FormState} object that
   * gets automatically set through the React context.
   */
  @observable parentForm: FormState | null = null;

  /**
   * An array of {@link FormState} objects that in the DOM are
   * the children of the current form.
   * Those forms will have a {@link FormState.parentForm} 
   * property set to this instance.
   */
  readonly childForms = observable.array<FormState>();
  
  /**
   * An array of {@link InputState} objects that in the DOM are
   * the children of the current form.
   * Those inputs will have a {@link InputState.parentForm} 
   * property set to this instance.
   */
  readonly childInputs = observable.array<InputState>();

  /**
   * The last action that was applied to the form state.
   */
  @observable lastAction: FormAction = FormAction.Init;

  /**
   * Returns the combined result of all hooks after invocation,
   * and updates each time the state changes.
   */
  @computed get hooksResult(): FormHookObject {
    return this.computeHooksResult();
  }

  /**
   * Returns the error that should be displayed in the UI.
   */
  @computed get error() {
    return this.hooksResult.error ?? null;
  }

  /**
   * Returns `true` if the form must be disabled,
   * either through the parent elements, the JSX attributes or the hook result.
   */
  @computed get isDisabled(): boolean {
    return (
      this.parentForm?.isDisabled ||
      this.elementProps.disabled ||
      this.hooksResult.disabled ||
      false);
  }

  /**
   * Returns `true` if there is at least one child input which has an error.
   */
  @computed get hasErrorInputs() {
    return this.childInputs.some(input => !!input.error);
  }

  /**
   * Returns `true` if there is at least one child input which has an error
   * and {@link InputState.showMessage} returning `true`.
   */
  @computed get hasVisibleErrorMessageInputs() {
    return this.childInputs.some(input => !!input.error && input.showMessage);
  }

  /**
   * Returns `true` if there is at least one child input which has an error
   * and {@link InputState.showStatus} returning `true`.
   */
  @computed get hasVisibleErrorStatusInputs() {
    return this.childInputs.some(input => !!input.error && input.showStatus);
  }

  /**
   * Returns `true` if either {@link FormState.hasVisibleErrorMessageInputs} or
   * {@link FormState.hasVisibleErrorStatusInputs} is `true`.
   */
  @computed get hasVisibleErrorInputs() {
    return (
      this.hasVisibleErrorMessageInputs ||
      this.hasVisibleErrorStatusInputs);
  }

  /**
   * Returns `true` if there is at least one child input which has been submitted.
   */
  @computed get hasSubmittedInputs() {
    return this.childInputs.some(input => input.isSubmitted);
  }

  /**
   * Returns `true` if there is at least one child input which has been changed once.
   */
  @computed get hasChangedOnceInputs() {
    return this.childInputs.some(input => !!input.isChangedOnce);
  }

  /**
   * Updates the state when a `submit` event occurs on the form.
   */
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

  /**
   * Updates the state when an `invalid` event occurs on the form.
   */
  @action
  handleInvalid = (evt: FormEvent) => {
    evt.preventDefault();
    this.elementProps.onInvalid?.(evt, this);
  }

  /**
   * Updates the state when a `reset` event occurs on the form.
   */
  @action
  handleReset = (evt: FormEvent) => {
    this.elementProps.onReset?.(evt, this);
  }

  /**
   * Updates the state when a `change` event occurs on the form.
   */
  @action
  handleChange = (evt: FormEvent) => {
    this.elementProps.onChange?.(evt, this);
  }

  /**
   * Updates the state when the parent form of this instance changes.
   */
  @action
  handleParentChange = (parent: FormState | null) => {
    this.parentForm = parent;
  }

  /**
   * Attaches a child form to this instance.
   */
  @action
  attachForm(form: FormState) {
    this.childForms.push(form);
  }

  /**
   * Detaches a child form from this instance.
   */
  @action
  detachForm(form: FormState) {
    this.childForms.remove(form);
  }

  /**
   * Attaches a child input to this instance.
   */
  @action
  attachInput(input: InputState) {
    this.childInputs.push(input);
  }

  /**
   * Detaches a child input from this instance.
   */
  @action
  detachInput(input: InputState) {
    this.childInputs.remove(input);
  }

  /**
   * Handler for changes in the React element property attributes.
   */
  @action
  elementPropsChanged(props: FormProps) {
    this.elementProps = props;
  }

  /**
   * Fully resets the state of the form by resetting all its child objects.
   */
  @action 
  reset(){
    this.childInputs.forEach((input: InputState) => input.reset());
  }

  private computeHooksResult(): FormHookObject {
    const mergedHook = unifyFormHooks(this.hooks);
    return mergedHook(this, this.lastAction) ?? {};
  }
}

export function useFormState(props?: Props, modelOptions: ModelOptions<FormState> = {}): FormState {
  const kernel = useKernel();
  return useModel(() => new FormState(kernel, props), modelOptions);
}