import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/schema/**/*.graphql',
  documents: [
    './src/**/*.graphql',
    './src/**/*.ts',
    './src/**/*.tsx',
    '!./src/**/*.spec.ts',
    '!./src/**/*.spec.tsx',
  ],
  generates: {
    './src/.generated/graphql.ts': {
      plugins: [
        "typescript",
        "typescript-apollo-client-helpers",
        "typescript-operations",
        "typescript-graphql-request"
      ],
      config: {
        maybeValue: 'T | undefined',
        preResolveTypes: false
      }
    }
  },
  ignoreNoDocuments: true,
};

export default config;