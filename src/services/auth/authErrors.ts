export const AuthErrorLookup = {

  'Auth.ExistingSessionNotFound': {
    message: `No valid existing session has been found.`
  },

  'Auth.ExistingSessionExpired': {
    message: `The existing session has expired.`
  },

  'Auth.FlowAlreadyExecuting': {
    message: `There is a flow which is already running.`
  },

  'Auth.InvalidToken': {
    message: `The token is invalid.`
  },

  'Auth.InvalidPermit': {
    message: `The AuthPermit is invalid.`
  },

  'Auth.TokenExpired': {
    message: `The token has expired.`
  },
  
  'Auth.FetchIdentityError': {
    message: `Failed to fetch the identity for the context.`
  }
};