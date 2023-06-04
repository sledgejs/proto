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
 * Wrapper around a Promise object which can be controlled externally.
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

	promise: Promise<T>;
	private resolvePromise!: PromiseResolveFunc<T>;
	private rejectPromise!: PromiseRejectFunc<TError | Error>;

	isResolved = false;
	isRejected = false;

	get isSettled() {
		return this.isResolved || this.isRejected;
	}

	readonly timeout: number | null = null;
	readonly autoStart: boolean | null = null;

	private timeoutId: ReturnType<typeof setTimeout> | null = null;

	start() {
		const { timeout } = this;
		if (timeout)
			this.timeoutId = setTimeout(this.handleTimeout, timeout);
	}

	resolve(val?: T) {
		if (this.isSettled)
			return console.warn(`PromiseRelay has already been settled. Call will be discarded.`);

		this.resolvePromise(val!);
		this.isResolved = true;
		this.clearTimeout();
	}

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