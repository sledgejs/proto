export const ApiErrorLookup = {
  'Api.NotAuthorized': {
    message: `The user is not authorized to access this API resource.`
  },

  'Api.RetryRequestFailed': {
    message: `The request failed after retrying.`
  },

  'Api.AuthContextInvalidated': {
    message: `AuthContext got invalidated.`
  },

  'Api.ProviderNotAuthorized': {
    message: `The raw request failed with a 401 HTTP Unauthorized error.`
  },

  'Api.GraphQlError': {
    message: `An error related to GraphQL has occurred.`
  },

  'Api.UploadError': {
    message: `An error occurred while uploading the file.`
  },

  'Api.MalformedResponse': {
    message: `The response from the server is either malformed or missing.` 
  }
}