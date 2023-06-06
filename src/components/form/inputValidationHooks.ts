import isEmail from 'validator/lib/isEmail';
import { Func } from '../../core/types';
import { ErrorCode } from '../../errors/errorCode';
import { Error } from '../../errors/error';
import { getErrorArray } from '../../errors/errorUtils';
import { InputHook, InputHookObject } from './inputSchema';
import { InputState } from './inputState';

export function softError(err: string, input: InputState): InputHookObject {
  return {
    error: err,
    showMessage: input.isSubmitted,
    showStatus: (
      input.isSubmitted ||
      input.isChangedOnce ||
      input.isBlurredOnce)
  }
}

export function required(msg: string): InputHook {
  return (input) => {
    if (!input.value || !input.value?.match?.(/\w/))
      return softError(msg, input);
  }
}

export function url(msg: string): InputHook {
  return (input) => {
    const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    const regex = new RegExp(expression);
    if (input.value && !input.value.match(regex))
      return softError(msg, input);
  }
}

export function duplicated(msg: string, duplicated: Func<boolean | null>): InputHook {
  return (input) => {
    const isDuplicated = duplicated();
    if (isDuplicated)
      return softError(msg, input);
  }
}


export function maxLength(msg: string, maxLength: number): InputHook {
  return (input) => {
    if (input.value?.length > maxLength)
      return softError(msg, input);
  }
}

export function pattern(msg: string, pattern: RegExp): InputHook {
  return (input) => {
    if (!pattern.test(input.value))
      return softError(msg, input);
  }
}


export function requiredEmail(msg: string): InputHook {
  return (input) => {
    const { value } = input;
    if (!value || !isEmail(value))
      return softError(msg, input);
  }
}

export function requiredEmailList(msg: string): InputHook {
  return (input) => {
    if (!input.value.split(',').every((val: string) => isEmail(val.trim())))
      return softError(msg, input)
  }
}

export function password(msg?: string): InputHook {
  return (input) => {
    let length = input.value?.length;

    if (input && Number.isFinite(length) && length < 8)
      return softError(msg ?? 'Your password must be at least 8 characters', input);
  }
}

export function forwardInputError(
  errorFunc: Func<Error | null>,
  codes: Iterable<ErrorCode>,
  params: InputHookObject = { showStatus: true }): InputHook {

  return () => {

    const error = errorFunc();
    if (!error)
      return;

    const errors = getErrorArray(error);
    const codesSet = new Set<ErrorCode>(codes);

    for (const err of errors) {
      if (codesSet.has(err.code)) {
        return {
          error: err,
          ...params
        }
      }
    }

    return;
  }
}