import { Dayjs } from 'dayjs';
import { ChangeEvent, MouseEvent, ReactNode } from 'react';
import { ObservableRef } from '../../core/observableRef';
import { DateTimeInterval, NumberInterval } from '../../core/types';
import { Error } from '../../errors/error';
import { InputState } from './inputState';

export enum InputStatus {
  None = 'None',
  Success = 'Success',
  Loading = 'Loading',
  Error = 'Error'
}

export enum InputAction {
  Init = 'Init',
  Mount = 'Mount',
  Unmount = 'Unmount',
  Focus = 'Focus',
  Blur = 'Blur',
  Hover = 'Hover',
  Unhover = 'Unhover',
  Change = 'Change',
  Press = 'Press',
  Check = 'Check',
  Uncheck = 'Uncheck',
  Submit = 'Submit'
}

export enum InputRole {
  Button = 'Button',
  CheckBox = 'CheckBox',
  CheckBoxGroup = 'CheckBoxGroup',
  ComboBox = 'ComboBox',
  Select = 'Select',
  TextField = 'TextField',
  Radio = 'Radio',
  RadioGroup = 'RadioGroup',
  Option = 'Option',
  SpinButton = 'SpinButton',
  Slider = 'Slider',
  DateTimeRangePicker = 'DateRangePicker',
  DateTimePicker = 'DatePicker',
  ToggleGroup = 'ToggleGroup'
}

export type InputHook =
  (state: InputState, action: InputAction) => Partial<InputHookObject> | null | undefined;

export type InputImperativeHook =
  (state: InputState, action: InputAction) => void;

export type InputHookObject = {
  label?: ReactNode | null;
  error?: ReactNode | Error | null;
  success?: ReactNode | boolean | null;
  loading?: ReactNode | boolean | null;
  disabled?: boolean | null;
  showStatus?: boolean | null;
  showMessage?: boolean | null;
}

export type DateRangeChangeEvent = {
  value: DateTimeInterval;
}

export type NumberRangeChangeEvent = {
  value: NumberInterval;
}

export type TextFieldChangeEventHandler = (evt: React.ChangeEvent<HTMLInputElement>, state: InputState) => void;
export type DateRangeChangeEventHandler = (evt: DateRangeChangeEvent, state: InputState) => void;
export type NumberRangeChangeEventHandler = (evt: NumberRangeChangeEvent, state: InputState) => void;
export type CheckboxGroupChangeEventHandler = (val: Set<string>, state: InputState) => void;
export type RadioGroupChangeEventHandler = (val: string, state: InputState) => void;
export type ChangeEventHandler = (evt: React.ChangeEvent | React.PointerEvent | React.MouseEvent, state: InputState) => void;
export type FocusEventHandler = (evt: React.FocusEvent, state: InputState) => void;
export type PointerEventHandler = (evt: React.PointerEvent, state: InputState) => void;

export enum CheckBoxValue {
  Checked = 'Checked',
  Unchecked = 'Unchecked',
  Indeterminate = 'Indeterminate'
}

export type InputValue<TRole extends InputRole = InputRole> =
  TRole extends InputRole.DateTimePicker ? Dayjs :
  TRole extends InputRole.DateTimeRangePicker ? DateTimeInterval :
  TRole extends InputRole.Slider ? NumberInterval :
  TRole extends InputRole.TextField ? string :
  TRole extends InputRole.SpinButton ? number :
  TRole extends InputRole.CheckBox ? boolean :
  TRole extends InputRole.CheckBoxGroup ? Set<string> :
  TRole extends InputRole.Radio ? boolean :
  TRole extends InputRole.RadioGroup ? string :
  TRole extends InputRole.ComboBox ? Set<string> :
  TRole extends InputRole.Option ? boolean :
  TRole extends InputRole.Select ? string :
  any;

export type InputChangeEventHandler<TRole extends InputRole = InputRole> =
  TRole extends InputRole.TextField ? TextFieldChangeEventHandler :
  TRole extends InputRole.DateTimeRangePicker ? DateRangeChangeEventHandler :
  TRole extends InputRole.Slider ? NumberRangeChangeEventHandler :
  TRole extends InputRole.CheckBoxGroup ? CheckboxGroupChangeEventHandler :
  TRole extends InputRole.RadioGroup ? RadioGroupChangeEventHandler :
  ChangeEventHandler;

export type InputProps<TRole extends InputRole = InputRole> = {
  id?: string;
  value?: InputValue<TRole> | null;
  initialValue?: InputValue<TRole> | null;
  modelRef?: ObservableRef<InputState | null> | null;
  label?: ReactNode | null;
  hooks?: InputHook[];
  imperativeHooks?: InputImperativeHook[];
  disabled?: boolean | null;
  error?: ReactNode | Error | null;
  onChange?: InputChangeEventHandler<TRole> | null;
  onPress?: PointerEventHandler | null;
  onFocus?: FocusEventHandler | null;
  onBlur?: FocusEventHandler | null;
  onPointerEnter?: PointerEventHandler | null;
  onPointerLeave?: PointerEventHandler | null;
}

export type OmitInputProps<T extends Partial<InputProps>> = Omit<T, keyof InputProps>;

export interface IInputProvider<TRole extends InputRole> {

  localValue?: InputValue<TRole> | null;
  inheritedValue?: InputValue<TRole> | null;

  handleChange?(evt: ChangeEvent<HTMLInputElement>): void;
  handleClick?(evt: MouseEvent<HTMLInputElement>): void;
}

export interface IInputState {

}