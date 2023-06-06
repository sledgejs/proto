import jwtDecode from 'jwt-decode';
import isEqual from 'lodash/isEqual';
import { isFiniteNumber, isNonEmptyString } from '../../core/typeUtils';
import { Result } from '../../core/types';
import { isTokenValid } from './authUtils';
import { Error } from '../../errors/error';
import { getNowSeconds } from '../../core/dateTimeUtils';
import { AuthTokenPayload } from './authSchema';

/**
 * Represents an object returned by the auth provider when the authorization succeeded
 * and all defensive checks on the tokens have passed.
 */
export type AuthPermitData = {
  token: string | null;
  tokenPayload: Partial<AuthTokenPayload | null>;
};

type AuthPermitPreparedData = {
  token: string;
  tokenPayload: AuthTokenPayload;
}


/**
 * Container for the tokens obtained for the current authenticated state.
 * This object only represents a partially authenticated state, since a fully authenticated
 * state also requires a {@link UserIdentity}.
 * 
 * @remark
 * This object is immutable using `Object.freeze`.
 */
export class AuthPermit {

  private static IdCursor = 1;

  /**
   * Creates a new instance of AuthPermit.
   * The data object needs to have been validated using `isAuthPermitDataValid`, otherwise an `AssertionError` is thrown.
   * Use `tryCreateAuthPermit` if you're not sure about the data validity.
   */
  private constructor(data: AuthPermitPreparedData) {

    this.permitId = (AuthPermit.IdCursor++).toString();

    this.token = data.token;
    this.tokenExpires = data.tokenPayload.exp;
    this.tokenPayload = data.tokenPayload;

    // make the object immutable
    Object.freeze(this);
    Object.freeze(this.tokenPayload);
  }

  /**
   * Creates a new instance of AuthPermit or returns an error if the data is invalid.
   */
  static create(data: AuthPermitData): Result<AuthPermit> {

    const [preparedData, err] = prepareAuthPermitData(data);
    if (err)
      return [null, err];

    const permit = new AuthPermit(preparedData!);
    return [permit];
  }

  readonly permitId: string;
  
  /**
   * The sample JWT token of the permit.
   * @remark
   * Since this is only a sample implementation, in real-life scenarios
   * there would be multiple tokens defined (ID token, access token, refresh token).
   */
  readonly token: string;

  /**
   * The expiration timestamp, in milliseconds, of the sample JWT token.
   */
  readonly tokenExpires: number;

  /**
   * The sample payload of the sample JWT token.
   */
  readonly tokenPayload: AuthTokenPayload;

  /**
   * Returns `true` if the current sample token is still valid (not expired).
   */
  get isTokenValid() {
    return isTokenValid(this.tokenExpires);
  }

  /**
   * Returns `true` if the permit is still valid (no token has expired).
   */
  get isValid() {
    return this.isTokenValid;
  }
}

function prepareAuthPermitData(data: AuthPermitData): Result<AuthPermitPreparedData> {

  let {
    token,
    tokenPayload
  } = data;

  // validate that we have an ID token
  if (!isNonEmptyString(token))
    return [null, new Error('Auth.InvalidToken')];

  // if a payload is provided, we will compare it against the decoded token payload
  let decodedIdTokenPayload: AuthTokenPayload;
  try {
    decodedIdTokenPayload = jwtDecode(token);
  } catch (err) {
    return [null, new Error('Auth.InvalidToken')];
  }

  if (tokenPayload) {
    if (!isEqual(tokenPayload, decodedIdTokenPayload))
      console.warn(`The provided token payload is different from the decoded one. The provided token payload will be used.`);
  } else {
    tokenPayload = decodedIdTokenPayload;
  }

  const { sub, exp, iat} = tokenPayload;

  if (
    !isFiniteNumber(exp) ||
    !isFiniteNumber(iat) ||
    !isNonEmptyString(sub))
    return [null, new Error('Auth.InvalidToken')];

  if (exp <= getNowSeconds())
    return [null, new Error('Auth.TokenExpired')];

  const validatedToken: string = token;
  const validatedTokenPayload: AuthTokenPayload = {
    sub,
    exp,
    iat
  }

  const validatedData = {
    token: validatedToken,
    tokenPayload: validatedTokenPayload
  }

  return [validatedData];
}