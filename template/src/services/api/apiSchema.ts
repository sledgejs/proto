/**
 * Describes how an API request should be authorized.
 */
export enum ApiRequestAuthMode {
  /**
   * Requests should be sent with authorization headers if the user is
   * authenticated, but they should also be sent without authorization headers
   * if the user is anonymous.
   */
  Public = 'Public',
  Private = 'Private',
  Authenticator = 'Authenticator'
}