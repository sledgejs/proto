import { isDefinedObject } from './typeUtils';

export function assert(condition: boolean, msg?: string | Error | undefined): asserts condition is true {
  if (!condition) {
    if (typeof msg === 'string')
      throw new Error(`AssertionError: ${msg}`);
    else if (isDefinedObject(msg))
      throw msg;

    throw new Error(`AssertionError`);
  }
}
export const _assert = assert;

export function assertNotNull<T>(arg: T, msg?: string | Error | undefined): asserts arg is NonNullable<T> {
  return assert(arg !== null && arg !== undefined, msg || `Expected value to not be null or undefined.`);
}
export const _assertNotNull = assertNotNull;

export function assertDefined<T>(arg: T, msg?: string | Error | undefined): asserts arg is NonNullable<T> {
  if (import.meta.env.PROD)
    return;

  return assert(arg !== null && arg !== undefined, msg || `Expected value to not be null or undefined.`);
}

export function assertNullOrUndefined<T>(arg: T | null | undefined, msg?: string | Error | undefined): asserts arg is (null | undefined) {
  if (import.meta.env.PROD)
    return;

  return assert(arg === null || arg === undefined, msg || `Expected value to be null or undefined.`);
}

export function assertFalse(arg: boolean, msg?: string | Error | undefined): asserts arg is false {
  return assert(arg === false, msg || `Expected value to be false.`);
}

export function assertTrue(arg: boolean, msg?: string | Error | undefined): asserts arg is true {
  return assert(arg === false, msg || `Expected value to be true.`);
}

export function assertNull(arg: any, msg?: string | Error | undefined): asserts arg is null {
  return assert(arg === false, msg || `Expected value to be null.`);
}

export function assertObject(arg: any, msg?: string | Error | undefined): asserts arg is NonNullable<object> {
  return assert(
    arg !== null &&
    arg !== undefined &&
    typeof arg === 'object',

    msg || `Expected value to be a non-null object.`);
}