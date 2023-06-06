import { ReactNode } from 'react';
import { ObservableRef } from '../../core/observableRef';
import { Error } from '../../errors/error';
import { FormState } from './formState';

/**
 * Standardizes all actions that can occur on a form.
 */
export enum FormAction {
  Init = 'Init',
  Mount = 'Mount',
  Unmount = 'Unmount',
  Submit = 'Submit',
  Reset = 'Reset'
}

/**
 * Describes the changes to apply to a form state through a {@link FormHook}.
 */
export type FormHookObject = {
  error?: string | Error | null;
  success?: string | boolean | null;
  loading?: string | boolean | null;
  disabled?: boolean | null;
  showMessage?: boolean | null;
  showStatus?: boolean | null;
}

/**
 * A function which gets called each time the state of a form changes
 * and can return updates to be applied to the state.
 * 
 * @param state   The form state which was changed
 * @param action  The type of action that caused the form state to change
 */
export type FormHook =
  (state: FormState, action: FormAction) => Partial<FormHookObject> | null | undefined;

/**
 * A function which gets called each time the state of a form changes
 * in order to execute custom behavior and not update the state.
 * 
 * @param state   The form state which was changed
 * @param action  The type of action that caused the form state to change
 */
export type FormImperativeHook =
  (state: FormState, action: FormAction) => void;

export type FormEventHandler = (evt: React.SyntheticEvent, state: FormState) => void;

export type SubmitEventHandler = (evt: React.FormEvent, state: FormState) => void;

export type FormProps = {
  id?: string;
  containerId?: string;
  modelRef?: ObservableRef<FormState | null> | null;
  hooks?: FormHook[];
  imperativeHooks?: FormImperativeHook[];
  error?: ReactNode | Error | null;
  disabled?: boolean | null;
  onSubmit?: SubmitEventHandler | null;
  onReset?: FormEventHandler | null;
  onInvalid?: FormEventHandler | null;
  onChange?: FormEventHandler | null;
}

export type OmitFormProps<T> = Omit<T, keyof FormProps>;

export type FormPropsWithAttributes =
  OmitFormProps<React.FormHTMLAttributes<{}>> &
  FormProps;