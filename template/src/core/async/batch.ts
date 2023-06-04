import { AsyncResult, Result } from '../types';
import { isPromise } from './async';

export type BatchFunc<T> = (...args: any[]) => Result<T> | AsyncResult<T>;
export type BatchFuncList<T> = [
  ...BatchFunc<any>[],
  BatchFunc<T>
];

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