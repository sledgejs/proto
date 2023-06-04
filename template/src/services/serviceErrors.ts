import { withTypedKeysErrorLookup } from '../errors/errorLookupUtils';

export const ServiceErrorLookup = withTypedKeysErrorLookup({
  'Services.LoadServiceFailed': {
    message: `Failed to load the service.`
  }
});