import { Error } from '../../errors/error';
import { ErrorCode } from '../../errors/errorCode';
import { ErrorTransform } from '../../errors/errorSchema';
import { isError } from '../../errors/errorUtils';
import { sleep } from './async';
import { AsyncResult, Result, AbortableParams } from '../types';

type Options = AbortableParams & {
  timeout?: number | null;
  errorTransform?: ErrorTransform | null;
}

export type PromiseResolver<T> =
  (value: Result<T> | PromiseLike<Result<T>>) => void;

export type PromiseRejector =
  (reason?: any) => void

export type PromiseExecutor<T> = (
  resolve: PromiseResolver<T>,
  reject: PromiseRejector) => void;

export type PromisifyOptions = Options;

const AbortedResult: Result<any> = [null, new Error(ErrorCode.Aborted)];
const TimeoutResult: Result<any> = [null, new Error(ErrorCode.Timeout)];

export async function promisify<T>(
  executor: PromiseExecutor<T>,
  opts: Options = {})
  : AsyncResult<T> {

  const {
    abortSignal,
    timeout,
    errorTransform
  } = opts;

  if (abortSignal?.aborted)
    return AbortedResult;

  if (timeout === 0)
    return TimeoutResult;

  try {

    const promise = new Promise<Result<T>>((resolve, reject) => {

      if (abortSignal) {
        abortSignal.addEventListener('abort', () =>
          resolve(AbortedResult));
      }

      if (timeout) {
        sleep(timeout).then(() =>
          resolve(TimeoutResult));
      }

      executor(resolve, reject);
    });

    const result = await promise;
    return result;
  }

  catch (rawErr) {

    if (isError(rawErr))
      return [null, rawErr];

    if (typeof errorTransform === 'function') {
      const transErr = errorTransform(rawErr);
      return [null, transErr];
    }

    return [null, new Error(ErrorCode.UnknownError, {
      source: rawErr
    })];
  }
}