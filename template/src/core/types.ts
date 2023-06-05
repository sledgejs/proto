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

export type Enum = Record<string, string | number>;

export type Key = string | number | symbol;

export type Constructor<T = {}> = new (...args: any[]) => T;

export type Func<T, TArgs extends any[] = any[]> = (...args: TArgs) => T;

export type FilterFunc<T> = (element: T, index: number, array: T[]) => boolean;

export type Interval<T> = {
  start: T;
  end: T;
}

export type AbortableProps = {
  abortSignal?: AbortSignal | null;
}

export type AbortableParams = {
  abortSignal?: AbortSignal | null;
}

export type DateTimeInterval = Interval<Dayjs>;
export type NumberInterval = Interval<number>;

export type Result<TResult = true, TError extends Error = Error> =
  [TResult] |
  [TResult, null] |
  [null, TError];

export type AsyncResult<TResult = true, TError extends Error = Error> =
  Promise<Result<TResult, TError>>;