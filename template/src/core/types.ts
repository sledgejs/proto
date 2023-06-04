import { Dayjs } from 'dayjs';
import { Error } from '../errors/error';

export type Maybe<T> = T | null | undefined;
export type MaybePartial<T> = Maybe<Partial<T>>;

export type MaybeProps<T> = {
  [key in keyof T]?: Maybe<T[key]>
};

export type NullableProps<T> = {
  [key in keyof T]?: T[key] | null;
};

export type RequiredProps<T> = {
  [P in keyof Required<T>]: NonNullable<T[P]>;
}

export type ObjectLiteral = Record<string, any>;

export type Enum = Record<string, string | number>;

export type Result<TResult = true, TError extends Error = Error> =
  [TResult] |
  [TResult, null] |
  [null, TError];

export type AsyncResult<TResult = true, TError extends Error = Error> =
  Promise<Result<TResult, TError>>;

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