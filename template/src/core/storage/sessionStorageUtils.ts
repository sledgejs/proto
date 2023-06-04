import { Result } from '../../core/types';
import { Error } from '../../errors/error';
import { ErrorCode } from '../../errors/errorCode';
import { StorageValue } from './storageSchema';
import { fromStorageValue, isStorageSupported, toStorageValue } from './storageUtils';

export function isSessionStorageSupported() {
  try {
    return isStorageSupported(sessionStorage);
  } catch (e) {
    return false;
  }
}

export function getSession(key: string, decode?: false): string | null;
export function getSession<T extends StorageValue = StorageValue>(key: string, decode?: true): T | null;
export function getSession<T extends StorageValue = StorageValue>(key: string, decode = false): T | null {
  if (!isSessionStorageSupported())
    return null;
  return fromStorageValue(
    sessionStorage.getItem(key), decode) as T;
}

export function setSession(key: string, val: StorageValue | null, encode = false): Result<boolean> {
  if (!isSessionStorageSupported())
    return [null, new Error(ErrorCode.SessionStorageNotAvailable)];

  const value = toStorageValue(val, encode);
  try {
    sessionStorage.setItem(key, value);
  } catch (err) {
    return [null, new Error(ErrorCode.SessionStorageValueNotSetProperly, { source:  err })];
  }

  // check that the value has been actually set
  if (sessionStorage.getItem(key) !== value)
    return [null, new Error(ErrorCode.SessionStorageValueNotSetProperly)];

  return [true];
}

export function removeSession(key: string) {
  if (!isSessionStorageSupported())
    return null;
  return sessionStorage.removeItem(key);
}

export function consumeSession(key: string, decode?: false): string | null;
export function consumeSession<T extends StorageValue = StorageValue>(key: string, decode?: true): T | null;
export function consumeSession<T extends StorageValue = StorageValue>(key: string, decode = false): T | null {
  const val = getSession<T>(key, decode as any); // TODO: check if there's a nice solution to fix the typings
  removeSession(key);
  return val;
}