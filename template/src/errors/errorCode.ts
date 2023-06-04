import { getEnumLikeObjectFromLookup } from '../core/enumUtils';
import { ErrorLookup } from './errorLookup';

export type ErrorCode = keyof typeof ErrorLookup;

export const ErrorCode = getEnumLikeObjectFromLookup(ErrorLookup);