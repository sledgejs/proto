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
 * Exposes an `AsyncIterable` object and also methods to control it programatically.
 * @typeParam T - The type of the iteration value.
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

  /**
   * The time in milliseconds after which the iterable will return a Timeout error.
   */
  readonly iterationTimeout: number | null;

  /**
   * The iterable which is being controlled.
   */
  readonly iterable: AsyncIterable<T>;
  
  private promiseRelay: PromiseRelay<T> | null = null;

  /**
   * Instructs the iterable to yield a new value.
   */
  next(val: T) {
    if (this.promiseRelay)
      this.promiseRelay.resolve(val);

    this.createPromiseRelay();
  }

  /**
   * Instructs the iterable to complete.
   */
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