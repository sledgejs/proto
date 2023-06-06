import { Result } from '../../core/types';
import { Error } from '../../errors/error';
import { ErrorCode } from '../../errors/errorCode';
import { StorageValue } from './storageSchema';
import { fromStorageValue, isStorageSupported, toStorageValue } from './storageUtils';

export function isLocalStorageSupported() {
  try {
    return isStorageSupported(localStorage);
  } catch (err) {
    return false;
  }
}

export function getLocal(key: string, decode?: false): string | null;
export function getLocal<T extends StorageValue = StorageValue>(key: string, decode?: true): T | null;
export function getLocal<T extends StorageValue = StorageValue>(key: string, decode = false): T | null {
  if (!isLocalStorageSupported())
    return null;
  return fromStorageValue(
    localStorage.getItem(key), decode) as T;
}

export function setLocal(key: string, val: StorageValue | null, encode = false): Result<boolean> {
  if (!isLocalStorageSupported())
    return [null, new Error(ErrorCode.LocalStorageNotAvailable)];

  const value = toStorageValue(val, encode);
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    return [null, new Error(ErrorCode.LocalStorageValueNotSetProperly, { source:  err })];
  }

  // check that the value has been actually set
  if (localStorage.getItem(key) !== value)
    return [null, new Error(ErrorCode.LocalStorageValueNotSetProperly)];

  return [true];
}

export function removeLocal(key: string) {
  if (!isLocalStorageSupported())
    return null;
  return localStorage.removeItem(key);
}

export function consumeLocal(key: string, decode?: false): string | null;
export function consumeLocal<T extends StorageValue = StorageValue>(key: string, decode?: true): T | null;
export function consumeLocal<T extends StorageValue = StorageValue>(key: string, decode = false): T | null {
  const val = getLocal<T>(key, decode as any); // TODO: check if there's a nice solution to fix the typings
  removeLocal(key);
  return val;
}