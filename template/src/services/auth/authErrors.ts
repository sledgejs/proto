import { withTypedKeysErrorLookup } from '../../errors/errorLookupUtils';

export const AuthErrorLookup = withTypedKeysErrorLookup({

  'Auth.ExistingSessionNotFound': {
    message: `No valid existing session has been found.`
  },

  'Auth.ExistingSessionExpired': {
    message: `The existing session has expired.`
  },

  'Auth.FlowAlreadyExecuting': {
    message: `There is a flow which is already running.`
  },

  'Auth.InvalidToken': {},
  'Auth.InvalidPermit': {},
  'Auth.TokenExpired': {},
  'Auth.FetchIdentityError': {}
  
});