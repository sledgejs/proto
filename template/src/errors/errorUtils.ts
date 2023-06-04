import { isNonEmptyString } from '../core/typeUtils';
import { Maybe, Result } from '../core/types';
import { Error, ErrorProps } from './error';
import { ErrorGroup } from './errorGroup';
import { ErrorCode } from './errorCode';
import { DefaultErrorHeading, DefaultErrorMessage } from './errorSchema';
import { NativeError } from './nativeError';
import { isResult } from '../core/typeUtils';

export function getErrorDisplayMessage(
  err: Maybe<Error | string>,
  defaultMessage = DefaultErrorMessage) {

  if (typeof err === 'string')
    return err;
  return err?.displayMessage ?? defaultMessage;
}

export function getErrorDisplayHeading(
  err: Maybe<Error | string>,
  defaultHeading = DefaultErrorHeading) {

  if (typeof err === 'string')
    return err;
  return err?.displayHeading ?? defaultHeading;
}

export function isNativeError(arg: any): arg is NativeError {
  return arg instanceof NativeError;
}

export function isError(arg: any): arg is Error {
  return arg instanceof Error;
}

export function isErrorGroup(arg: any): arg is ErrorGroup {
  return (
    arg instanceof Error &&
    arg.code === ErrorCode.ErrorGroup);
}

export function isErrorResult(arg: any, code?: ErrorCode | null): arg is [null, Error] {
  const isErrorRes = (
    isResult(arg) &&
    arg[1] instanceof Error);

  if (!isErrorRes)
    return false;

  if (code)
    return arg[1]?.code === code;

  return true;
}

/**
 * If the provided error has the ErrorGroup code, then the `childErrors` property will be returned.
 * Otherwise, an array containing the provided error as the only item will be returned.
 * Useful when you have to deal with errors which can be groups but also non-groups, 
 * in order to simplify the error checking code.
 */
export function getErrorArray(err: Error): Error[] {
  if (err.code === ErrorCode.ErrorGroup)
    return err.childErrors;
  return [err];
}

/**
 * If the provided array has a single item, then that item will be returned directly.
 * If the provided array has more than one item, a new Error with the code ErrorGroup will be created and returned.
 * If the provided array has no items then the default is returned, which can either be another Error or null.
 */
export function createErrorFromArray(errors: Error[], defaultError: Error = new Error(ErrorCode.UnknownError)): Error {
  if (!Array.isArray(errors) || errors.length === 0)
    return defaultError;

  if (errors.length === 1)
    return errors[0];

  return new ErrorGroup(errors);
}

export function createErrorFromErrorCodeArray(errorCodes: ErrorCode[], defaultErrorCode: ErrorCode = ErrorCode.UnknownError): Error {
  return createErrorFromArray(
    errorCodes.map(code => new Error(code)),
    new Error(defaultErrorCode));
}

export function toError(arg: any, props: ErrorProps = {}): Error {
  if (isError(arg))
    return arg;

  if (isNonEmptyString(arg)) {
    if (Object.keys(ErrorCode).includes(arg))
      return new Error(arg as ErrorCode, props);
  }

  return new Error(ErrorCode.UnknownError, {
    ...props,
    source: arg
  });
}

/**
 * Returns true if the provided object is an instance of DOMException
 * and the error is an AbortError.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMException#exception-AbortError
 */
export function isDOMAbortError(err: any): err is DOMException {

  return (
    (err instanceof DOMException) && (
      // the code and constant appear in MDN as "legacy", so currently I'm unsure
      // whether they will work in every browser or not and if they're futureproof against deprecation
      // this is why the check is so verbose
      (err.code === DOMException.ABORT_ERR) ||
      (err.name === 'AbortError') ||
      (err.message === 'Aborted')));
}