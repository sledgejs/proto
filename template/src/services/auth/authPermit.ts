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
 * Represents a response from the Auth provider which guarantees that the tokens
 * have been properly obtained, they are valid and the state data has been properly read.
 * This enables a transactional response from the Auth provider in which the authorization
 * either fails or succeeds, without having to deal with partially corrupted data or transient states.
 * ---
 * **NOTE**:  In a real authorization flow, this permit is half of the process, 
 *            with the other half being the fetching of the `UserProfile` object.
 *            See `AuthContext` for the complete object which underlies a fully authorized state.
 * ---
 * This object is immutable using `Object.freeze`.
 */
export class AuthPermit {

  private static IdCursor = 1;

  /**
   * Creates a new instance of AuthPermit.
   * The data object needs to have been validated using `isAuthPermitDataValid`, otherwise an `AssertionError` is thrown.
   * Use `tryCreateAuthPermit` if you're not sure about the data validity.
   * @param data  The data based on which to create the permit.
   * @throws {AssertionError}
   */
  private constructor(data: AuthPermitPreparedData) {

    this.id = (AuthPermit.IdCursor++).toString();

    this.token = data.token;
    this.tokenExpires = data.tokenPayload.exp;
    this.tokenPayload = data.tokenPayload;

    // make the object immutable
    Object.freeze(this);
    Object.freeze(this.tokenPayload);
  }

  static create(data: AuthPermitData): Result<AuthPermit> {

    const [preparedData, err] = prepareAuthPermitData(data);
    if (err)
      return [null, err];

    const permit = new AuthPermit(preparedData!);
    return [permit];
  }

  readonly id: string;
  readonly token: string;
  readonly tokenExpires: number;
  readonly tokenPayload: AuthTokenPayload;

  get isTokenValid() {
    return isTokenValid(this.tokenExpires);
  }

  get isValid() {
    return this.isTokenValid;
  }
}

export function createAuthPermit(data: AuthPermitData): Result<AuthPermit> {
  return AuthPermit.create(data);
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