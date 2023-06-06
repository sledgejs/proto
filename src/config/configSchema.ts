import { LogFilter } from '../diagnostics/logSchema';

export type ConfigSchema = {
  kernel: {
    nodeIdSize: number;
  },

  diagnostics: {
    logLabelMaxLength: number;
    integerFormat: string;
    floatFormat: string;
    includeLogs: LogFilter[];
    excludeLogs: LogFilter[];
  },

  routing: {
    storage: {
      keyPrefix: string;
      lastPrivatePathKey: string;
    }
  },

  storage: {
    testKey: string;
    testValue: string;
  },

  auth: {
    tokenExpiryDelta: number
  },

  api: {
    graphql: {
      endpointUrl: string;
      subscriptionsEndpointUrl: string;
    }

    apollo: {
      clientName: string;
      clientVersion: string;
      enableCache: boolean;
    }
  },

  react: {
    strictMode: boolean;
  }
}