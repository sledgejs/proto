import { Config } from '../../config/config';
import { getNowSeconds } from '../../core/dateTimeUtils';
import { isDefinedObject, isNonEmptyString } from '../../core/typeUtils';
import { Maybe, MaybeProps } from '../../core/types';
import { LoginInput } from './authInputSchema';

const AuthConfig = Config.auth;
const TokenExpiryDelta = AuthConfig.tokenExpiryDelta; // in milliseconds

/** 
 * Utility for checking the expiration timestamp against the current one. 
 */
export function isTokenValid(expires: Maybe<number>): boolean {
  if (!expires)
    return false;
  return expires > getNowSeconds() + TokenExpiryDelta / 1000;
}

export function isValidLoginInput(input: MaybeProps<LoginInput>): input is LoginInput {

  if (!isDefinedObject(input))
    return false;

  if (
    !isNonEmptyString(input.username) ||
    !isNonEmptyString(input.password))
    return false;

  return true;
}