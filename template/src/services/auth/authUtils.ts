import { Config } from '../../config/config';
import { getNowSeconds } from '../../core/dateTimeUtils';
import { isFiniteNumber, isNonEmptyString } from '../../core/typeUtils';
import { Maybe } from '../../core/types';
import { AuthTokenPayload } from './authSchema';

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