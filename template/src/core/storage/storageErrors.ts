import { withTypedKeysErrorLookup } from '../../errors/errorLookupUtils';

export const StorageErrorLookup = withTypedKeysErrorLookup({
  'SessionStorageNotAvailable': {
    message: `Session storage is not available.`
  },
  
  'SessionStorageValueNotSetProperly': {
    message: `Could not set the value in session storage properly.`
  },
  
  'LocalStorageNotAvailable': {
    message: `Local storage is not available.`
  },
  
  'LocalStorageValueNotSetProperly': {
    message: `Could not set the value in local storage properly.`
  }
});

