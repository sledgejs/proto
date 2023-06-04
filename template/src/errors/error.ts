import { ErrorCode } from './errorCode';
import { ErrorLookup } from './errorLookup';

type Props = {
  /**
   * Contains the object on which this Error will be based.
   * Can be an API response object, a response string, a native Error instance, etc.
   * If the source object is also an Error object, use `innerError` instead.
   */
  source?: any | null;

  /**
   * Used when the Error to be instanced is based on another Error 
   * and you want to keep track of the original error.
   */
  innerError?: Error | null;

  /** 
   * The error message as it should appear to developers, 
   * and possibly to the user if the error must be displayed and no `displayMessage` field is provided.
   */
  message?: string | null;
}

export type ErrorProps = Props;

export class Error {
  constructor(code: ErrorCode, props: Props = {}) {

    const info = ErrorLookup[code] ?? null;

    this.code = code;
    this.message = info?.message ?? `An error has occurred.`;
    this.displayHeading = info?.displayHeading ?? null;
    this.displayMessage = info?.displayMessage ?? this.message;

    this.source = props.source ?? null;

    this.innerError = props.innerError ?? null;
  }

  readonly code: ErrorCode;
  readonly message: string;
  readonly displayHeading: string | null;
  readonly displayMessage: string;
  readonly source: any | null = null;
  readonly innerError: Error | null = null;
  readonly childErrors: Error[] = [];
}