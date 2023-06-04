import { withTypedKeysErrorLookup } from '../../errors/errorLookupUtils';

export const ResourceErrorLookup = withTypedKeysErrorLookup({
  'Resources.LoadScriptFailed': {
    message: `Failed to load the script.`
  }
});