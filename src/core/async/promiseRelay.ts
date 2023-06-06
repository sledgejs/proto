import { Error } from '../../errors/error';
import { ErrorCode } from '../../errors/errorCode';

export type PromiseResolveFunc<T> = (value: T | PromiseLike<T>) => void
export type PromiseRejectFunc<TReason> = (reason?: TReason) => void;

export type PromiseRelayProps = {
	timeout?: number | null;
	autoStart?: boolean | null;
}

export const PromiseRelayDefaultProps: PromiseRelayProps = {
	timeout: null,
	autoStart: false
}

/**
 * Exposes a `Promise` object and also methods to control it programatically.
 * @typeParam T       - The type of the value the Promise will resolve to.
 * @typeParam TError  - The type of the error the Promise will reject to.
 */
export class PromiseRelay<T, TError = any> {

	constructor(props: PromiseRelayProps = PromiseRelayDefaultProps) {
		props = {
			...PromiseRelayDefaultProps,
			...props
		};

		this.promise = new Promise((res, rej) => {
			this.resolvePromise = res;
			this.rejectPromise = rej;
		});

		this.timeout = props.timeout ?? null;
		this.autoStart = props.autoStart ?? null;

		if (this.autoStart !== false)
			this.start();
	}

  /** 
   * Returns the Promise that is being controlled.
   */
	promise: Promise<T>;

	private resolvePromise!: PromiseResolveFunc<T>;
	private rejectPromise!: PromiseRejectFunc<TError | Error>;

  /** 
   * Returns true if the Promise has been resolved. 
   */
	isResolved = false;
  
  /** 
   * Returns true if the Promise has been rejected. 
   */
	isRejected = false;

  /** 
   * Returns true if the Promise has been either resolved or rejected. 
   */
	get isSettled() {
		return this.isResolved || this.isRejected;
	}

  /** 
   * Returns the value of the `timeout` property as it has been specified in the constructor props.
   */
	readonly timeout: number | null = null;
  
  /** 
   * Returns the value of the `autoStart` property as it has been specified in the constructor props.
   */
	readonly autoStart: boolean | null = null;

	private timeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Starts the timeout clock, if a {@link PromiseRelayProps.timeout | timeout} has been provided.
   */
	start() {
		const { timeout } = this;
		if (timeout)
			this.timeoutId = setTimeout(this.handleTimeout, timeout);
	}

  /**
   * Resolves the Promise using the provided value.
   * 
   * @param val The value with which to resolve the Promise.
   */
	resolve(val?: T) {
		if (this.isSettled)
			return console.warn(`PromiseRelay has already been settled. Call will be discarded.`);

		this.resolvePromise(val!);
		this.isResolved = true;
		this.clearTimeout();
	}

  /**
   * Rejects the Promise using the provided error.
   * 
   * @param err The error with which to reject the Promise.
   */
	reject(err?: TError | Error) {
		if (this.isSettled)
			return console.warn(`PromiseRelay has already been settled. Call will be discarded.`);

		this.rejectPromise(err);
		this.isRejected = true;
		this.clearTimeout();
	}

	private clearTimeout = () => {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}

	private handleTimeout = () => {
		if (this.isSettled)
			return console.warn(`PromiseRelay has already been settled but a timeout handler has been invoked.`);

		this.reject(new Error(ErrorCode.Aborted));
	}
}