import { Dayjs } from 'dayjs';
import { Error } from '../errors/error';

/**
 * Utility type to mark a type as possibly being `null` or `undefined`.
 */
export type Maybe<T> = T | null | undefined;

/**
 * Utility type to mark a type as possibly being `null` or `undefined`
 * and also being a `Partial<T>` version of it.
 */
export type MaybePartial<T> = Maybe<Partial<T>>;

/**
 * Utility type to mark a type as having all its fields possibly `null` or `undefined`.
 */
export type MaybeProps<T> = {
  [key in keyof T]?: Maybe<T[key]>
};

/**
 * Utility type to mark a type as having all its fields possibly `null`.
 */
export type NullableProps<T> = {
  [key in keyof T]?: T[key] | null;
};

/**
 * Utility type to mark a type as requiring all its fields to never be `null`.
 */
export type RequiredProps<T> = {
  [P in keyof Required<T>]: NonNullable<T[P]>;
}

/**
 * Utility type to represent all object literals.
 */
export type ObjectLiteral = Record<string, any>;

/**
 * Utility type to represent native TS enums as objects.
 */
export type Enum = Record<string, string | number>;

/**
 * Utility type to represent a key in an object.
 */
export type Key = string | number | symbol;

/**
 * Utility type to represent a constructor in a class.
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Utility type to represent a callable function.
 */
export type Func<T, TArgs extends any[] = any[]> = (...args: TArgs) => T;

/**
 * Utility type to represent a predicate function to be used in filter-like functions.
 */
export type FilterFunc<T> = (element: T, index: number, array: T[]) => boolean;

/**
 * Generic type for representing a (start, end) interval.
 */
export type Interval<T> = {
  start: T;
  end: T;
}

/**
 * Specialized type for representing a DateTime interval, using Dayjs.
 */
export type DateTimeInterval = Interval<Dayjs>;

/**
 * Specialized type for representing a number interval.
 */
export type NumberInterval = Interval<number>;

/**
 * Extendable type for initializing objects which support aborting.
 */
export type AbortableProps = {
  abortSignal?: AbortSignal | null;
}

/**
 * Extendable type for passing parameters to functions which support aborting.
 */
export type AbortableParams = {
  /**
   * The abort signal that will cause the async operation to be aborted, if triggered.
   * If no abort signal is provided then the operation cannot be aborted.
   */
  abortSignal?: AbortSignal | null;
}

/**
 * Represents a 2-tuple that is returned by synchronous operations which can fail.
 * See the documentation on Error handling for more details.
 * 
 * @typeParam TResult - Type of the return value, if the operation succeeds
 * @typeParam TError  - Type of the error, if the operation fails. 
 *                      In practice this should always be the managed {@link Error} class
 */
export type Result<TResult = true, TError extends Error = Error> =
  [TResult] |
  [TResult, null] |
  [null, TError];

/**
 * Represents a 2-tuple that is returned by asynchronous operations which can fail.
 * See the documentation on Error handling for more details.
 * 
 * @typeParam TResult - Type of the return value, if the operation succeeds
 * @typeParam TError  - Type of the error, if the operation fails. 
 *                      In practice this should always be the managed {@link Error} class
 */
export type AsyncResult<TResult = true, TError extends Error = Error> =
  Promise<Result<TResult, TError>>;