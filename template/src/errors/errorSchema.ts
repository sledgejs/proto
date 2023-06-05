import { Error } from './error';
import { ErrorCode } from './errorCode';

/**
 * Object used in error lookups to map a set of properties
 * to a specific {@link ErrorCode}.
 */
export type ErrorDescriptor = {
  /** @inheritDoc Error.message */
  message?: string | null;

  /** @inheritDoc Error.displayMessage */
  displayMessage?: string | null;

  /** @inheritDoc Error.displayHeading */
  displayHeading?: string | null;
  
  /** @inheritDoc Error.canBeUserTriggered */
  canBeUserTriggered?: boolean | null;
}

export type ErrorTransform = (rawErr: any) => Error;

export const DefaultErrorMessage = 'An error has occurred.';
export const DefaultErrorHeading = 'Oops, something went wrong.';