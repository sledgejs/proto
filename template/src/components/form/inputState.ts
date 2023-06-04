import { action, computed, makeObservable, observable } from 'mobx';
import { ChangeEvent, FunctionComponent, ReactNode } from 'react';
import { Kernel } from '../../kernel/kernel';
import type { InputHookObject, InputHook, InputImperativeHook, InputProps, DateRangeChangeEventHandler, DateRangeChangeEvent, ChangeEventHandler, InputValue, IInputProvider, NumberRangeChangeEvent, NumberRangeChangeEventHandler, RadioGroupChangeEventHandler } from './inputSchema';
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
import { isIterable } from '../../core/typeUtils';
import { LabelState } from './labelState';

type Props<TRole extends InputRole = InputRole> = {
  role: TRole;
  component: FunctionComponent;
  id?: string | null;
  value?: any;
  initialValue?: any;
}

export class InputState<TRole extends InputRole = InputRole>
  extends Node {

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

  readonly role: TRole;
  readonly component: FunctionComponent;
  readonly initialId: string | null;

  readonly nativeInputRef = new ObservableRef<HTMLInputElement | null>(null);

  readonly provider: IInputProvider<TRole> | null = null;

  @observable.ref elementProps: InputProps = {};
  @observable elementValue: any = null;
  @observable initialValue: InputValue<TRole> | null = null;

  @computed get hooks(): InputHook[] {
    return this.elementProps.hooks ?? [];
  }

  @computed get imperativeHooks(): InputImperativeHook[] {
    return this.elementProps.imperativeHooks ?? [];
  }

  @computed get inputId(): string | null {
    return this.elementProps.id ?? this.initialId;
  }

  @observable parentForm: FormState | null = null;
  @observable parentField: FieldState | null = null;
  @observable parentInput: InputState | null = null;
  @observable parentLabel: LabelState | null = null;

  readonly innerInputs = observable.array<InputState>();

  @observable optionId: string | null = null;

  @observable lastAction = InputAction.Init;
  @observable isFocused = false;
  @observable isHovered = false;

  @observable isChecked = false;
  @observable isIndeterminate = false;

  @computed get isControlled() {
    switch (this.role) {
      case InputRole.CheckBox:
        return this.parentInput?.role === InputRole.CheckBoxGroup;
    }
  }

  @observable.ref localValue: InputValue<TRole> | null = null;

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

  @computed get value(): InputValue<TRole> | null {

    if ('value' in this.elementProps)
      return this.elementProps.value ?? null;

    if (this.localValue) {
      return this.localValue;
    }

    if (this.isControlled)
      return this.inheritedValue;

    if (this.initialValue !== null && !this.isChangedOnce) {
      return this.initialValue;
    }

    return this.localValue;
  }

  @computed get isDirty(): boolean {
    if (this.initialValue) {
      return !(this.value === this.initialValue);
    }

    return !!this.localValue;
  }

  @observable isChangedOnce = false;
  @observable isFocusedOnce = false;
  @observable isBlurredOnce = false;

  @computed get isDisabled(): boolean {
    return (
      this.parentForm?.isDisabled ||
      this.parentInput?.isDisabled ||
      this.elementProps.disabled ||
      this.hooksResult.disabled ||
      false);
  }

  @computed get label(): ReactNode | null {
    return this.hooksResult.label ?? null;
  }

  @computed get error(): ReactNode | Error | null {
    return this.hooksResult.error ?? null;
  }

  @computed get showMessage() {
    return this.hooksResult.showMessage ?? null;
  }

  @computed get showStatus() {
    return this.hooksResult.showStatus ?? null;
  }

  @computed get hooksResult(): InputHookObject {
    return this.computeHooksResult();
  }

  @observable isSubmitted = false;

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
  setInitialValue = (initialValue: any) => {
    this.initialValue = initialValue;
  }

  @action
  private clearSubmitStatus() {
    this.isSubmitted = false;
  }

  /**
   * Handler for the React effect which monitors the changes of the parent form, through FormContext.
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
   */
  @action
  parentInputAttached = (parentInput: InputState | null) => {
    parentInput &&
      trace(this, `Parent input attached`, { parentInput: parentInput });

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
   * Handler for the React effect which monitors the changes of the parent / sibling label through LabelContext.
   */
  @action
  parentLabelAttached = (parentLabel: LabelState | null) => {
    parentLabel &&
      trace(this, `Parent label attached`, { parentLabel: parentLabel });

    this.parentLabel = parentLabel;
    parentLabel?.setLabelId(this.elementProps.id);
  }

  /**
   * Disposer for the React effect which monitors the changes of the parent / sibling label through LabelContext.
   */
  @action
  parentLabelDetached = () => {
    const { parentLabel } = this;
    parentLabel &&
      trace(this, `Parent label detached`, { previousParentLabel: parentLabel });

    parentLabel?.clearLabelId();
  }

  @action
  handleFocus = (evt: React.FocusEvent) => {
    this.isFocused = true;
    this.lastAction = InputAction.Focus;
    this.isFocusedOnce = true;
  }

  @action
  handleBlur = (evt: React.FocusEvent) => {
    this.isFocused = false;
    this.lastAction = InputAction.Blur;
    this.isBlurredOnce = true;
  }

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

  @action
  handleInvalid = (evt: React.SyntheticEvent) => {
    evt.preventDefault();
  }

  @action
  handleSubmit = (evt: React.FormEvent) => {
    this.isSubmitted = true;
  }

  @action
  handlePointerEnter = (evt: React.PointerEvent) => {
    this.isHovered = true;
    this.lastAction = InputAction.Hover;
  }

  @action
  handlePointerLeave = (evt: React.PointerEvent) => {
    this.isHovered = false;
    this.lastAction = InputAction.Unhover;
  }

  @action
  attachInput(input: InputState) {
    this.innerInputs.push(input);
  }

  @action
  detachInput(input: InputState) {
    this.innerInputs.remove(input);
  }

  @action
  elementPropsChanged(props: InputProps) {
    this.elementProps = props;
    this.parentLabel?.setInputId(props?.id ?? null);
  }

  @action
  elementValueChanged(value: any) {
    trace(this, `elementValueChanged()`, { value });
    this.elementValue = value;
    this.localValue = value;
  }

  @action
  handleTextInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
    this.clearSubmitStatus();

    this.localValue = evt.target.value as any;

    const onChange = this.elementProps.onChange as ChangeEventHandler;

    this.isChangedOnce = true;
    onChange?.(evt, this);
  }

  @action
  handleDateRangePickerChange = (evt: DateRangeChangeEvent) => {
    this.clearSubmitStatus();

    const onChange = this.elementProps.onChange as DateRangeChangeEventHandler;

    this.isChangedOnce = true;
    onChange?.(evt, this);
  }

  @action
  handleNumberRangePickerChange = (evt: NumberRangeChangeEvent) => {
    this.clearSubmitStatus();

    const onChange = this.elementProps.onChange as NumberRangeChangeEventHandler;

    this.isChangedOnce = true;
    onChange?.(evt, this);
  }

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

  @action
  handleSelectChange = (value: string) => {
    this.localValue = value as InputValue<TRole>;
    const onChange = this.elementProps.onChange as ChangeEventHandler;
    this.isChangedOnce = true;
    onChange?.({ value } as any, this);
  }

  @action
  handleImagePickerChange = (value: string) => {
    this.localValue = value as InputValue<TRole>;
    const onChange = this.elementProps.onChange as ChangeEventHandler;
    this.isChangedOnce = true;
    onChange?.({} as any, this);
  }

  @action
  handleRadioGroupItemChange = (value: string) => {
    this.localValue = value as InputValue<TRole>;
    const onChange = this.elementProps.onChange as RadioGroupChangeEventHandler;
    this.isChangedOnce = true;
    onChange?.(value, this);
  }

  @action
  handleToggleGroupChange = (value: string) => {
    if (!value)
      return;
    this.localValue = value as InputValue<TRole>;
    const onChange = this.elementProps.onChange as ChangeEventHandler;
    this.isChangedOnce = true;
    onChange?.({} as any, this);
  }

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