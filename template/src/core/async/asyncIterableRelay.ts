import { PromiseRelay, PromiseRelayProps } from './promiseRelay';

class Iterable<T>
  implements AsyncIterable<T> {

  constructor(getPromise: () => Promise<T> | null) {
    this.getPromise = getPromise;
  }

  readonly getPromise: () => Promise<T> | null;

  async*[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    let promise: Promise<T> | null;
    while (!!(promise = this.getPromise())) {
      yield await promise;
    }
  }
}

export type AsyncIterableRelayProps = {
  iterationTimeout?: number | null;
}

export const AsyncIterableRelayDefaultProps: AsyncIterableRelayProps = {
  iterationTimeout: null
}

/**
 * Represents an AsyncIterable object which can be controlled by an external object.
 */
export class AsyncIterableRelay<T> {

  constructor(props: AsyncIterableRelayProps = AsyncIterableRelayDefaultProps) {
    props = {
      ...AsyncIterableRelayDefaultProps,
      ...props
    };

    this.iterationTimeout = props.iterationTimeout ?? null;

    this.iterable = new Iterable<T>(() => this.promiseRelay?.promise ?? null);
    this.createPromiseRelay();
  }

  readonly iterationTimeout: number | null;

  readonly iterable: AsyncIterable<T>;
  private promiseRelay: PromiseRelay<T> | null = null;

  next(val: T) {
    if (this.promiseRelay)
      this.promiseRelay.resolve(val);

    this.createPromiseRelay();
  }

  done(val: T) {
    if (this.promiseRelay)
      this.promiseRelay.resolve(val);

    this.promiseRelay = null;
  }

  private createPromiseRelay() {
    // if there's an iterationTimeout set on this instance
    // we apply the timeout to the next promise relay 

    const promiseRelayProps: PromiseRelayProps = {};
    const { iterationTimeout } = this;
    if (iterationTimeout) {
      promiseRelayProps.timeout = iterationTimeout;
      promiseRelayProps.autoStart = true;
    }

    this.promiseRelay = new PromiseRelay<T>();
  }
}