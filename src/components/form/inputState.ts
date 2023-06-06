import { action, computed, makeObservable, observable } from 'mobx';
import { ChangeEvent, FunctionComponent, ReactNode } from 'react';
import { Kernel } from '../../kernel/kernel';
import type { InputHookObject, InputHook, InputImperativeHook, InputProps, DateRangeChangeEventHandler, DateRangeChangeEvent, ChangeEventHandler, InputValue, NumberRangeChangeEvent, NumberRangeChangeEventHandler, RadioGroupChangeEventHandler } from './inputSchema';
import { InputAction, InputRole } from './inputSchema';
import { FormState } from '../form/formState';
import { initDev } from '../../dev';
import { trace } from '../../dev';
import { Node } from '../../kernel/node';
import { FieldState } from './fieldState';
import { useModel } from '../componentHooks';
import { ObservableRef } from '../../core/observableRef';
import { useKernel } from '../../kernel/kernelHooks';
import { mergeInputHooks } from './inputUtils';
import { Error } from '../../errors/error';
import { isDefined, isIterable } from '../../core/typeUtils';
import { LabelState } from './labelState';

type Props<TRole extends InputRole = InputRole> = {
  role: TRole;
  component: FunctionComponent;
  id?: string | null;
  value?: any;
  initialValue?: any;
}

/**
 * Backing object for all inputs in the application.
 * This class holds state at a very granular level, allowing for very complex
 * validation and styling scenarios which would otherwise be a 
 * lot more complicated using JSX.
 * @typeParam TRole The type of the role of the input, 
 *            from which a lot of other types will be inferred.
 */
export class InputState<TRole extends InputRole = InputRole>
  extends Node {

  /**
   * Creates a new instance of {@link InputState} using
   * the provided arguments.
   */
  constructor(kernel: Kernel, props: Props<TRole>) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'red', typeName: props.role, logLevel: null });
    trace(this);

    this.role = props.role;
    this.component = props.component;
    this.initialId = props.id ?? null;
    this.initialValue = props.initialValue ?? null;
  }

  /**
   * The role of the input, based on which the behavior of the input will be determined.
   */
  readonly role: TRole;

  /**
   * The React.Component which renders this input.
   */
  readonly component: FunctionComponent;

  /**
   * The initial input ID for this instance.
   * This refers to the "id" attribute which will appear in DOM. 
   */
  readonly initialId: string | null;

  /**
   * React ref (observable) to the DOM input element.
   */
  readonly nativeInputRef = new ObservableRef<HTMLInputElement | null>(null);

  /**
   * The properties of the input as they have been set from React.
   */
  @observable.ref elementProps: InputProps = {};
  
  /**
   * The value of the input as it has been set from React.
   */
  @observable elementValue: any = null;

  /**
   * The initial value that should be displayed when the input loads
   * and if the form is reset.
   */
  @observable initialValue: InputValue<TRole> | null = null;

  /**
   * The value of the input that has been set by this instance of {@link InputState}.
   * We keep this separate because the actual value that is visible in the DOM
   * might come either from custom JSX attributes or through inheritance from parent
   * input states.
   */
  @observable.ref localValue: InputValue<TRole> | null = null;

  /**
   * Returns a value that is retrieved from the parent input if this input
   * is being controlled by that parent input.
   * In the implementation it should override the local value.
   */
  @computed get inheritedValue(): InputValue<TRole> | null {
    if (!this.isControlled)
      return null;

    switch (this.role) {
      case InputRole.CheckBox:

        const { optionId } = this;
        if (!optionId)
          return null;

        const parentValue = this.parentInput?.value;
        if (isIterable<string>(parentValue)) {
          const parentValueSet = new Set(parentValue);
          return parentValueSet.has(optionId) as InputValue<TRole>;
        }

        return false as InputValue<TRole>;
    }

    return null;
  }

  /**
   * The input array of hooks.
   */
  @computed get hooks(): InputHook[] {
    return this.elementProps.hooks ?? [];
  }

  /**
   * The input array of imperative hooks.
   */
  @computed get imperativeHooks(): InputImperativeHook[] {
    return this.elementProps.imperativeHooks ?? [];
  }

  @computed get inputId(): string | null {
    return this.elementProps.id ?? this.initialId;
  }

  /** 
   * Reference to the parent {@link FormState} object that
   * gets automatically set through the React context.
   */
  @observable parentForm: FormState | null = null;

  /** 
   * Reference to the parent [@link FieldState} object that
   * gets automatically set through the React context.
   */
  @observable parentField: FieldState | null = null;

  /** 
   * Reference to the parent {@link InputState} object that
   * gets automatically set through the React context.
   * That input will contain this instance in its {@link InputState.innerInputs} array.
   */
  @observable parentInput: InputState | null = null;

  /** 
   * Reference to the associated {@link LabelState} object that
   * gets automatically set through the React context.
   */
  @observable associatedLabel: LabelState | null = null;

  /**
   * An array of {@link InputState} objects that in the DOM are
   * the children of the current input.
   * Those inputs will have a {@link InputState.parentInput} 
   * property set to this instance.
   */
  readonly innerInputs = observable.array<InputState>();

  /**
   * The ID of an `Option` element when the {@link InputState.role} 
   * is set to {@link InputRole.Option}. 
   * Will get applied as `<option value=""/>` in the DOM.
   */
  @observable optionId: string | null = null;

  /**
   * The last action that was applied to the input state.
   */
  @observable lastAction = InputAction.Init;

  /**
   * Keeps track of the focus state of the input.
   */
  @observable isFocused = false;

  /**
   * Keeps track of the hover state of the input.
   */
  @observable isHovered = false;

  /**
   * The current checked state when the {@link InputState.role} 
   * is set to {@link InputRole.CheckBox} or {@link InputRole.Radio}. 
   * Will get applied as `<input type="checkbox" checked />` in the DOM.
   */
  @observable isChecked = false;

  /**
   * The "third" state of a checkbox when the {@link InputState.role} 
   * is set to {@link InputRole.CheckBox}.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#indeterminate_state_checkboxes
   */
  @observable isIndeterminate = false;

  /**
   * Returns `true` if the current state is the child of a parent {@link InputState}
   * and is functionally dependent on that parent, as it is the case with
   * checkbox groups, radio groups, options, etc.
   */
  @computed get isControlled(): boolean {
    switch (this.role) {
      case InputRole.CheckBox:
        return this.parentInput?.role === InputRole.CheckBoxGroup;

      case InputRole.Radio:
        return this.parentInput?.role === InputRole.RadioGroup;

      case InputRole.Option:
        return this.parentInput?.role === InputRole.Select;
    }
    return false;
  }

  /**
   * Returns the actual value that should be used for the input in the UI.
   * The priority of the value sources is the following:
   * 
   * 1. Value set through JSX
   * 2. {@link InputState.inheritedValue}
   * 3. {@link InputState.localValue}
   * 4. {@link InputState.initialValue}
   */
  @computed get value(): InputValue<TRole> | null {

    if ('value' in this.elementProps)
      return this.elementProps.value ?? null;

    if (this.isControlled)
      return this.inheritedValue;

    if (isDefined(this.localValue))
      return this.localValue;

    return this.initialValue;
  }

  /**
   * Returns `true` if the input has been modified at least once,
   * regardless of the current value.
   */
  @computed get isDirty(): boolean {
    if (this.initialValue) {
      return !(this.value === this.initialValue);
    }

    return !!this.localValue;
  }

  /**
   * Set to `true` if the input has been changed at least once.
   */
  @observable isChangedOnce = false;
  
  /**
   * Set to `true` if the input has been focused at least once.
   */
  @observable isFocusedOnce = false;
  
  /**
   * Set to `true` if the input has been blurred at least once.
   */
  @observable isBlurredOnce = false;

  /**
   * Set to `true` if the parent form of the input has been submitted.
   */
  @observable isSubmitted = false;

  /**
   * Returns `true` if the input must be disabled,
   * either through the parent elements, the JSX attributes or the hook result.
   */
  @computed get isDisabled(): boolean {
    return (
      this.parentForm?.isDisabled ||
      this.parentInput?.isDisabled ||
      this.elementProps.disabled ||
      this.hooksResult.disabled ||
      false);
  }

  /**
   * Returns the label that should be displayed in the UI.
   */
  @computed get label(): ReactNode | null {
    return this.hooksResult.label ?? null;
  }

  /**
   * Returns the error that should be displayed in the UI.
   */
  @computed get error(): ReactNode | Error | null {
    return this.hooksResult.error ?? null;
  }

  /**
   * Returns whether to show the text message regarding 
   * validation or information in the UI.
   * Does not refer to any other type of visual feedback.
   */
  @computed get showMessage() {
    return this.hooksResult.showMessage ?? null;
  }

  /**
   * Returns whether to show visual feedback (borders, icons, etc)
   * regarding validation or information in the UI.
   * Does not refer to the actual message content.
   */
  @computed get showStatus() {
    return this.hooksResult.showStatus ?? null;
  }

  /**
   * Returns the combined result of all hooks after invocation,
   * and updates each time the state changes.
   */
  @computed get hooksResult(): InputHookObject {
    return this.computeHooksResult();
  }

  /**
   * Setter for {@link InputState.initialValue}.
   */
  @action
  setInitialValue = (initialValue: any) => {
    this.initialValue = initialValue;
  }

  private computeHooksResult(): InputHookObject {
    const mergedHook = mergeInputHooks(this.hooks);
    return mergedHook(this, this.lastAction) ?? {};
  }

  private runImperativeHooks(): void {
    const action = this.lastAction;
    this.imperativeHooks.forEach(hook => {
      hook(this, action);
    }, {});
  }

  @action
  private clearSubmitStatus() {
    this.isSubmitted = false;
  }

  /**
   * Handler for the React effect which monitors the changes of the parent form, through FormContext.
   * @param parentForm The parent form state which has been attached.
   */
  @action
  parentFormAttached = (parentForm: FormState | null) => {
    this.clearSubmitStatus();

    parentForm &&
      trace(this, `Parent form ${parentForm._dev?.label} attached`, { parentForm });

    this.parentForm = parentForm;
    parentForm?.attachInput(this);
  }

  /**
   * Disposer for the React effect which monitors the changes of the parent form through FormContext.
   */
  @action
  parentFormDetached = () => {
    this.clearSubmitStatus();

    const { parentForm } = this;
    parentForm &&
      trace(this, `Parent form ${parentForm._dev?.label} detached`, { previousParentForm: parentForm });

    parentForm?.detachInput(this);
  }

  /**
   * Handler for the React effect which monitors the changes of the parent field through FieldContext.
   * @param parentField The parent field state which has been attached.
   */
  @action
  parentFieldAttached = (parentField: FieldState | null) => {
    parentField &&
      trace(this, `Parent field ${parentField._dev?.label} attached`, { parentField });

    this.parentField = parentField;
    parentField?.attachInput(this);
  }

  /**
   * Disposer for the React effect which monitors the changes of the parent field through FieldContext.
   */
  @action
  parentFieldDetached = () => {
    const { parentField } = this;
    parentField &&
      trace(this, `Parent field ${parentField._dev?.label} detached`, { previousParentField: parentField });

    parentField?.detachInput();
  }

  /**
   * Handler for the React effect which monitors the changes of the parent input through InputContext.
   * @param parentInput The parent input state which has been attached.
   */
  @action
  parentInputAttached = (parentInput: InputState | null) => {
    parentInput &&
      trace(this, `Parent input attached`, { parentInput });

    this.parentInput = parentInput;
    parentInput?.attachInput(this);
  }

  /**
   * Disposer for the React effect which monitors the changes of the parent input through InputContext.
   */
  @action
  parentInputDetached = () => {
    const { parentInput } = this;
    parentInput &&
      trace(this, `Parent input detached`, { previousParentInput: parentInput });

    parentInput?.detachInput(this);
  }


  /**
   * Handler for the React effect which monitors the changes of the associated label through LabelContext.
   * @param associatedLabel The associated label state which has been attached.
   */
  @action
  associatedLabelAttached = (associatedLabel: LabelState | null) => {
    associatedLabel &&
      trace(this, `Associated label attached`, { associatedLabel });

    this.associatedLabel = associatedLabel;
    associatedLabel?.setLabelId(this.elementProps.id);
  }

  /**
   * Disposer for the React effect which monitors the changes of the parent / sibling label through LabelContext.
   */
  @action
  associatedLabelDetached = () => {
    const { associatedLabel } = this;
    associatedLabel &&
      trace(this, `Parent label detached`, { previousAssociatedLabel: associatedLabel });

    associatedLabel?.clearLabelId();
  }

  /**
   * Updates the state when a `focus` event occurs on the input.
   * @param evt The event to handle.
   */
  @action
  handleFocus = (evt: React.FocusEvent) => {
    this.isFocused = true;
    this.lastAction = InputAction.Focus;
    this.isFocusedOnce = true;
  }

  /**
   * Updates the state when a `blur` event occurs on the input.
   * @param evt The event to handle.
   */
  @action
  handleBlur = (evt: React.FocusEvent) => {
    this.isFocused = false;
    this.lastAction = InputAction.Blur;
    this.isBlurredOnce = true;
  }

  /**
   * Updates the state when a `click` event occurs on the input.
   * @param evt The event to handle.
   */
  @action
  handleClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    switch (this.role) {
      case InputRole.Button:
        this.lastAction = InputAction.Press;
        break;

      case InputRole.CheckBox:
        if (this.isChecked) {
          this.lastAction = InputAction.Uncheck;
          this.isChecked = false;
        } else {
          this.lastAction = InputAction.Check;
          this.isChecked = true;
        }

        (this.elementProps.onChange as ChangeEventHandler)?.(evt, this);
        break;
    }
  }

  /**
   * Updates the state when an `invalid` event occurs on the input.
   * @param evt The event to handle.
   */
  @action
  handleInvalid = (evt: React.SyntheticEvent) => {
    evt.preventDefault();
  }

  /**
   * Updates the state when a `submit` event occurs on the input.
   * @param evt The event to handle.
   */
  @action
  handleSubmit = (evt: React.FormEvent) => {
    this.isSubmitted = true;
  }

  /**
   * Updates the state when a `pointerenter` event occurs on the input.
   * @param evt The event to handle.
   */
  @action
  handlePointerEnter = (evt: React.PointerEvent) => {
    this.isHovered = true;
    this.lastAction = InputAction.Hover;
  }

  /**
   * Updates the state when a `pointerleave` event occurs on the input.
   * @param evt The event to handle.
   */
  @action
  handlePointerLeave = (evt: React.PointerEvent) => {
    this.isHovered = false;
    this.lastAction = InputAction.Unhover;
  }

  /**
   * Attaches a child input to this instance.
   * @param input The input state to attach.
   */
  @action
  attachInput(input: InputState) {
    this.innerInputs.push(input);
  }

  /**
   * Detaches a child input from this instance
   * @param input The input state to detach.
   */
  @action
  detachInput(input: InputState) {
    this.innerInputs.remove(input);
  }

  /**
   * Handler for changes in the React element property attributes.
   */
  @action
  elementPropsChanged(props: InputProps) {
    trace(this, { props });

    this.elementProps = props;
    this.associatedLabel?.setInputId(props?.id ?? null);
  }

  /**
   * Handler for changes in the React element value attribute.
   * @param value The new value which has been set from React.
   */
  @action
  elementValueChanged(value: any) {
    trace(this, { value });
    
    this.elementValue = value;
    this.localValue = value;
  }

  /**
   * Handles changes to the value of an `<input type="text"/>`,
   * applying them accordingly to the current state.
   */
  @action
  handleTextInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
    this.clearSubmitStatus();

    this.localValue = evt.target.value as any;

    const onChange = this.elementProps.onChange as ChangeEventHandler;

    this.isChangedOnce = true;
    onChange?.(evt, this);
  }

  /**
   * Handles changes to the value of a {@link InputRole.DateTimeRangePicker},
   * applying them accordingly to the current state.
   * @param evt The event to handle.
   */
  @action
  handleDateTimeRangePickerChange = (evt: DateRangeChangeEvent) => {
    this.clearSubmitStatus();

    const onChange = this.elementProps.onChange as DateRangeChangeEventHandler;

    this.isChangedOnce = true;
    onChange?.(evt, this);
  }

  /**
   * Handles changes to the value of a {@link InputRole.NumberRangePicker},
   * applying them accordingly to the current state.
   * @param evt The event to handle.
   */
  @action
  handleNumberRangePickerChange = (evt: NumberRangeChangeEvent) => {
    this.clearSubmitStatus();

    const onChange = this.elementProps.onChange as NumberRangeChangeEventHandler;

    this.isChangedOnce = true;
    onChange?.(evt, this);
  }

  /**
   * Handles changes to the value of a `<input type="checkbox"/>`,
   * applying them accordingly to the current state.
   * @param evt The event to handle.
   */
  @action
  handleCheckboxChange = (evt: ChangeEvent<HTMLInputElement>) => {

    if (this.isChecked) {
      this.lastAction = InputAction.Uncheck;
      this.isChecked = false;
    } else {
      this.lastAction = InputAction.Check;
      this.isChecked = true;
    }

    (this.elementProps.onChange as ChangeEventHandler)?.(evt, this);
  }

  /**
   * Handles changes to the value of a {@link InputRole.Checkbox} 
   * which is part of a {@link InputRole.Checkbox},
   * applying them accordingly to the current state.
   * @param evt The event to handle.
   */
  @action
  handleCheckboxGroupItemCheckedChange = (checked: boolean | 'indeterminate', value: string | null) => {

    const currentValue = this.localValue ?? this.initialValue;

    let newValue = new Set<string>();
    if (isIterable(currentValue))
      newValue = new Set([...currentValue as any]); // WTF TS ??????????????????????????

    if (!value)
      return;

    if (checked === true)
      newValue.add(value);
    else
      newValue.delete(value);

    this.localValue = newValue as InputValue<TRole>;

    const onChange = this.elementProps.onChange as ChangeEventHandler;
    this.isChangedOnce = true;

    onChange?.(this.localValue as any, this);
  }

  /**
   * Fully resets the state of the input.
   */
  @action
  reset() {
    this.lastAction = InputAction.Init;
    this.isFocused = false;
    this.isHovered = false;

    this.isChecked = false;
    this.isIndeterminate = false;

    this.localValue = null;
    this.isChangedOnce = false;
    this.isFocusedOnce = false;
    this.isBlurredOnce = false;
    this.isSubmitted = false;
  }
}

export function useInputState(props: Props): InputState {
  const kernel = useKernel();
  return useModel(() => new InputState(kernel, props)); // todo: replace kernel with hook
}