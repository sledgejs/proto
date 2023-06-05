import { getEnumLikeObjectFromLookup } from '../core/enumUtils';
import { ErrorLookup } from './errorLookup';

export type ErrorCode = keyof typeof ErrorLookup;

/**
 * The complete list of error codes that are available across the application.
 */
export const ErrorCode = getEnumLikeObjectFromLookup(ErrorLookup);