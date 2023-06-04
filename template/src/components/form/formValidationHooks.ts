import intersection from 'lodash/intersection';
import { Func } from '../../core/types';
import { Error } from '../../errors/error';
import { ErrorCode } from '../../errors/errorCode';
import { isErrorGroup } from '../../errors/errorUtils';
import { FormAction, FormHook, FormHookObject } from './formSchema';
import { FormState } from './formState';

export function disableFormOnSubmit(isSubmittingFunc: Func<boolean>) {
  return () => {
    if (isSubmittingFunc()) {
      return {
        disabled: true
      }
    }
  }
}

export function forwardFormError(
  errorFunc: Func<Error | null>,
  params: FormHookObject = {}) {

  return forwardFormErrorWithMaskedCodes(errorFunc, [], params);
}

export function forwardFormErrorWithMaskedCodes(
  errorFunc: Func<Error | null>,
  maskedCodes: ErrorCode[] = [],
  params: FormHookObject = {}) {

  return () => {
    let error = errorFunc();
    if (error) {

      const ignoredCodes = intersection([error.code, ...error.childErrors.map(err => err.code)], maskedCodes);

      if (ignoredCodes.length > 0)
        error = new Error('Form.MultipleApiFormErrors');

      else if (isErrorGroup(error)) {
        error = new Error('Form.NonValidationMultipleApiFormErrors', {
          innerError: error
        });
      }

      return {
        error,
        ...params
      };
    }
  }
}

export function mergeFormHooks(hooks: FormHook[]) {

  return (form: FormState, action: FormAction) => {

    return hooks.reduce((obj, hook) => {
      return {
        ...obj,
        ...hook(form, action)
      }
    }, {} as FormHookObject);
  }
}