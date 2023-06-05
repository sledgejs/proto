import { isNonEmptyString } from '../core/typeUtils';
import { Maybe, Result } from '../core/types';
import { Error, ErrorProps } from './error';
import { ErrorGroup } from './errorGroup';
import { ErrorCode } from './errorCode';
import { DefaultErrorHeading, DefaultErrorMessage } from './errorSchema';
import { NativeError } from './nativeError';
import { isResult } from '../core/typeUtils';

/**
 * Attempts to extract a display message from the provided arguments.
 * @param err             The value to decode.
 *                        - If the value is an {@link Error} it returns the {@link Error.displayMessage} value.
 *                        - If the value is a `string` it is returned as it is.
 *                        - If no value is provided then the default value is returned.
 * @param defaultMessage  The value to decode if no `err` argument is provided.
 */
export function getErrorDisplayMessage(
  err: Maybe<Error | string>,
  defaultMessage = DefaultErrorMessage) {

  if (typeof err === 'string')
    return err;
  return err?.displayMessage ?? defaultMessage;
}

/**
 * 
 * Attempts to extract a display heading from the provided arguments.
 * @param err             The value to decode.
 *                        - If the value is an {@link Error} it returns the {@link Error.displayHeading} value.
 *                        - If the value is a `string` it is returned as it is.
 *                        - If no value is provided then the default value is returned.
 * @param defaultHeading  The value to decode if no `err` argument is provided.
 */
export function getErrorDisplayHeading(
  err: Maybe<Error | string>,
  defaultHeading = DefaultErrorHeading) {

  if (typeof err === 'string')
    return err;
  return err?.displayHeading ?? defaultHeading;
}

/**
 * Returns `true` if the argument is an instance of the native (global scope) `Error` class.
 * @param arg The value to check.
 */
export function isNativeError(arg: any): arg is NativeError {
  return arg instanceof NativeError;
}

/**
 * Returns `true` if the argument is an instance of the managed {@link Error} class.
 * @param arg The value to check.
 */
export function isError(arg: any): arg is Error {
  return arg instanceof Error;
}

/**
 * Returns `true` if the argument is a managed {@link Error} object with the `ErrorGroup` code.
 * The object does not have to be an instance of the {@link ErrorGroup} class.
 * @param arg The value to check.
 */
export function isErrorGroup(arg: any): arg is ErrorGroup {
  return (
    arg instanceof Error &&
    arg.code === ErrorCode.ErrorGroup);
}

/**
 * Returns `true` if the argument is a {@link Result} tuple and it represents an errored result.
 * @param arg   The value to check.
 * @param code  Makes the function return `true` only if the error has the code set to specified value.
 */
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
 * If the provided error has the `ErrorGroup` code, then the {@link Error.childErrors} property will be returned.
 * Otherwise, an array containing the provided error as the only item will be returned.
 * Useful when you have to deal with errors which can be groups but also non-groups, 
 * in order to simplify the error checking code.
 * @param err The error object to decode.
 */
export function getErrorArray(err: Error): Error[] {
  if (err.code === ErrorCode.ErrorGroup)
    return err.childErrors;
  return [err];
}

/**
 * If the provided array has a single item, then that item will be returned directly.
 * If the provided array has more than one item, a new {@link Error} 
 * with the code `ErrorGroup` will be created and returned.
 * If the provided array has no items then the default is returned, 
 * which can either be another `Error` or null.
 * @param errors        The input `Error` array.
 * @param defaultError  The `Error` to use if the `errors` array is empty.
 */
export function createErrorFromArray(errors: Error[], defaultError: Error = new Error(ErrorCode.UnknownError)): Error {
  if (!Array.isArray(errors) || errors.length === 0)
    return defaultError;

  if (errors.length === 1)
    return errors[0];

  return new ErrorGroup(errors);
}

/**
 * Similar to {@link createErrorFromArray} but instead of {@link Error} arguments, 
 * `ErrorCode` arguments are used. The logic is identical.
 * 
 * @param errorCodes        The input `ErrorCode` array.
 * @param defaultErrorCode  The `ErrorCode` to use if the `errorCodes` array is empty.
 */
export function createErrorFromErrorCodeArray(errorCodes: ErrorCode[], defaultErrorCode: ErrorCode = ErrorCode.UnknownError): Error {
  return createErrorFromArray(
    errorCodes.map(code => new Error(code)),
    new Error(defaultErrorCode));
}

/**
 * Attempts to convert the provided argument to an {@link Error} instance.
 * @param arg   The value to convert.
 *              - If the value is already an `Error` instance it's returned as is.
 *              - If the value is an `ErrorCode` then a new `Error` is created based on it.
 *              - Otherwise an error with the `UnknownError` code is created.
 * @param props The additional props to set on the `Error` instance if one is created.
 */
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
 * Returns `true` if the provided object is an instance of `DOMException`
 * and the error is an `AbortError`.
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