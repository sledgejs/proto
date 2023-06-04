import { Error } from '../../errors/error';
import { Result, AsyncResult } from '../types';

export type AsyncLoaderCallback<TValue = any, TError extends Error = Error> =
  () => AsyncResult<TValue, TError>;

/**
 * Simple utility which prevents duplicate calls on the same async resource.
 */
export class AsyncLoader<TValue = any, TError extends Error = Error> {

  constructor(callback: AsyncLoaderCallback<TValue, TError>) {
    this.callback = callback;
  }

  readonly callback: AsyncLoaderCallback<TValue, TError>;

  promise: AsyncResult<TValue, TError> | null = null;
  result: Result<TValue, TError> | null = null;

  get value(): TValue | null {
    return this.result?.[0] ?? null;
  }

  get error(): TError | null {
    return this.result?.[1] ?? null;
  }

  async load(retry = false): AsyncResult<TValue, TError> {

    // the main purpose of this class is to prevent duplicate calls on the same resource
    // as such, if there's already a non resolved promise, return it without any additional call to the resource
    if (this.promise) {
      if (this.error && retry) {
        // promise has previously rejected and the caller wants a retry
        // we clear the state and continue the execution of the loader
        this.result = null;
        this.promise = null;
      } else {
        // either the promise hasn't been rejected
        // or the caller doesn't want a retry, or both
        return this.promise;
      }
    }

    this.promise = this.callback();
    this.result = await this.promise;

    return this.promise;
  }
}