import type { ErrorDescriptor } from './errorSchema';

/** 
 * Utility to preserve the keys based on the definition. Does nothing at runtime. 
 */
export function withTypedKeysErrorLookup<T extends { [key: string]: ErrorDescriptor }>(lookup: T): Record<keyof T, ErrorDescriptor> {
  return lookup;
}