import { ReactNode } from 'react';
import { ObservableRef } from '../../core/observableRef';
import { Error } from '../../errors/error';
import { FormState } from './formState';

export enum FormAction {
  Init = 'Init',
  Mount = 'Mount',
  Unmount = 'Unmount',
  Submit = 'Submit',
  Reset = 'Reset'
}

export type FormHookObject = {
  error?: string | Error | null;
  success?: string | boolean | null;
  loading?: string | boolean | null;
  disabled?: boolean | null;
  showMessage?: boolean | null;
  showStatus?: boolean | null;
}

export type FormHook =
  (state: FormState, action: FormAction) => Partial<FormHookObject> | null | undefined;

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