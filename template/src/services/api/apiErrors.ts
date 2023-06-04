import { withTypedKeysErrorLookup } from '../../errors/errorLookupUtils';

export const ApiErrorLookup = withTypedKeysErrorLookup({
  'Api.NotAuthorized': {},
  'Api.RetryRequestFailed': {},
  'Api.AuthContextInvalidated': {
    message: `AuthContext got invalidated.`
  },

  'Api.ProviderNotAuthorized': {},

  'Api.GraphQlError': {},
  'Api.UploadError': {},
  'Api.MissingGraphQlData': {},
  'Api.FalsyMutationResult': {},
  'Api.MalformedResponse': {}
});