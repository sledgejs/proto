import { Error } from './error';

export type ErrorDescriptor = {
  message?: string | null;
  displayHeading?: string | null;
  displayMessage?: string | null;
  canBeUserTriggered?: boolean | null;
}

export type ErrorTransform = (rawErr: any) => Error;

export const DefaultErrorMessage = 'An error has occurred.';
export const DefaultErrorHeading = 'Oops, something went wrong.';