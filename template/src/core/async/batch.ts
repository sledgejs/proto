import { AsyncResult, Result } from '../types';
import { isPromise } from './async';

/**
 * Function which can be batched.
 */
export type BatchFunc<T> = (...args: any[]) => Result<T> | AsyncResult<T>;

/**
 * List of functions which can be batched.
 */
export type BatchFuncList<T> = [
  ...BatchFunc<any>[],
  BatchFunc<T>
];

/**
 * Runs a list of async functions that return results sequentially, 
 * stopping if an error result is returned by any of the functions.
 * Returns the result of the last function call.
 */
export async function batch<T>(funcs: BatchFuncList<T>, ...args: any[]): AsyncResult<T> {

  let lastRes: T | null = null;
  for (const func of funcs) {
    const resp = func(...args);

    const [res, err] = isPromise(resp) ?
      await resp :
      resp;

    if (err)
      return [null, err];

    lastRes = res;
  }

  return [lastRes!];
}