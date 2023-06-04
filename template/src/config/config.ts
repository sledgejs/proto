import { ConfigSchema } from './configSchema';

export const Config: ConfigSchema = {
  kernel: {
    nodeIdSize: 12
  },

  diagnostics: {
    logLabelMaxLength: 40,
    integerFormat: '',
    floatFormat: '',
    includeLogs: [],
    excludeLogs: [{
      object: ['Button', 'Form'],
      message: 'Parent form'
    }]
  },

  routing: {
    storage: {
      keyPrefix: 'routing.',
      lastPrivatePathKey: 'lastPrivatePath'
    }
  },

  storage: {
    testKey: 'STORAGE_TEST_KEY',
    testValue: 'STORAGE_TEST_VALUE'
  },

  auth: {
    tokenExpiryDelta: 5000
  },

  api: {
    graphql: {
      endpointUrl: import.meta.env.VITE_API_GRAPHQL_ENDPOINT_URL,
      subscriptionsEndpointUrl: import.meta.env.VITE_API_GRAPHQL_SUBSCRIPTIONS_ENDPOINT_URL
    },

    apollo: {
      clientName: 'SledgeTemplate',
      clientVersion: '1.0',
      enableCache: (import.meta.env.VITE_API_APOLLO_ENABLE_CACHE === 'true')
    }
  },

  react: {
    strictMode: (import.meta.env.VITE_REACT_STRICT_MODE === 'true') ?? true
  }
}