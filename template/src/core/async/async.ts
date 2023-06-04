import { AsyncResult, Result } from '../types';

export function sleep(timeout = 1000) {
  return new Promise(res => {
    setTimeout(res, timeout);
  });
}

export function isPromise<T>(arg: any): arg is Promise<T> {
  return arg instanceof Promise;
}