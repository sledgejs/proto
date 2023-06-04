import { Error } from '../errors/error';
import { Maybe, Result } from './types';
import dayjs, { Dayjs } from 'dayjs';

export function certifyType<T>(arg: any): asserts arg is T { }
export function certifyDefined<T>(arg: any): asserts arg is NonNullable<T> { }

export function isNullOrUndefined(arg: any): arg is null | undefined {
  return arg === null || arg === undefined;
}

export function isDefined<T>(arg: any): arg is Exclude<T, null | undefined> {
  return !isNullOrUndefined(arg);
}

export function isDefinedObject<T>(arg: any): arg is object & Exclude<T, null | undefined> {
  return typeof arg === 'object' && arg !== null;
}

export function isFiniteNumber<T>(arg: any): arg is number {
  return Number.isFinite(arg);
}

export function isFunction<T>(arg: any): arg is Function {
  return typeof arg === 'function'
}

export function callOrReturn<T>(arg: T | ((...args: any[]) => T)): T {
  if (isFunction(arg))
    return arg();
  return arg;
}

export function isSet<T = any>(arg: any): arg is Set<T> {
  return arg instanceof Set;
}

export function isResult<T = any>(arg: any): arg is Result<T> {

  if (!Array.isArray(arg))
    return false;

  if (arg.length < 1 || arg.length > 2)
    return false;

  const isValue =
    isDefined(arg[0]) &&
    !isDefined(arg[1]) &&
    !(arg[0] instanceof Error);

  const isError =
    !isDefined(arg[0]) &&
    isDefined(arg[1]) &&
    (arg[1] instanceof Error);

  return (
    (isValue && !isError) ||
    (!isValue && isError));
}

export function isNonEmptyString(arg: any): arg is string {
  return typeof arg === 'string' && arg.length > 0;
}

export function isIterable<T = any>(arg?: any): arg is Iterable<T> {
  if (!arg)
    return false;
  return !!arg[Symbol.iterator];
}

export function isAsyncIterable<T = any>(arg?: any): arg is AsyncIterable<T> {
  if (!arg)
    return false;
  return !!arg[Symbol.asyncIterator];
}

export function toValidDateTime(arg?: number | string | Dayjs | Date | null): Dayjs | null {

  const date = dayjs(arg)
  if (!date.isValid())
    return null;
  return date;
}