import { StorageErrorLookup } from '../core/storage/storageErrors';
import { ServiceErrorLookup } from '../services/serviceErrors';
import { AuthErrorLookup } from '../services/auth/authErrors';
import { ResourceErrorLookup } from '../services/resource/resourceErrors';

import { withTypedKeysErrorLookup } from './errorLookupUtils';
import { RoutingErrorLookup } from '../services/routing/routingErrors';
import { ApiErrorLookup } from '../services/api/apiErrors';

export const ErrorLookup = withTypedKeysErrorLookup({
  ...StorageErrorLookup,
  
  ...ServiceErrorLookup,
  ...ApiErrorLookup,
  ...AuthErrorLookup,
  ...RoutingErrorLookup,
  ...ResourceErrorLookup,

  ErrorGroup: {
    message: `Multiple errors have occurred.`
  },

  NotCallable: {
    message: `This method is not callable. It might be here only to implement a certain interface.`,
    displayMessage: `An error has occurred`
  },

  Aborted: {
    message: `The request was aborted.`,
    displayMessage: `The operation was interrupted.`
  },
  
  Timeout: {
    message: `The request timed out.`,
    displayMessage: `The operation timed out.`
  },

  Overruled: {
    message: `The request was overruled.`,
    displayMessage: `The operation was interrupted.`
  },

  Canceled: {
    message: `The activity was canceled.`,
    displayMessage: `The activity was canceled.`
  },

  InternalError: {
    message: `An unexpected error has occurred.`,
    displayMessage: `An unexpected error has occurred.`
  },

  InvalidCallError: {
    message: `The call to this method is invalid with the state of the target.`
  },

  InvalidState: {
    message: `The application reached a state in which it should not be.`
  },

  ParameterError: {
    message: `Invalid parameter provided.`
  },

  TaskAlreadyRunning: {
    message: `The task is already running.`
  },

  UnknownError: {
    message: `An unknown error has occurred.`
  },

  NetworkOffline: {
    message: `Network is offline.`
  }
});