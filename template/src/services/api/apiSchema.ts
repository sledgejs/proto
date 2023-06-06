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
  
  /**
   * Requests should always be sent with authorization headers which means
   * that the user should always be authenticated. If the user is not authenticated
   * or the current authenticated context expires and it cannot be refreshed
   * then the request should fail.
   */
  Private = 'Private',

  
  /**
   * Special type of request which can only run while the application is in 
   * the {@link AuthStateType.Authorizing} state, in order to fetch additional
   * resources required to build a fully authorized context.
   */
  Authenticator = 'Authenticator'
}