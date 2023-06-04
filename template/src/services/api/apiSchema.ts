import { ApolloClient, DocumentNode, MutationOptions, OperationVariables, QueryOptions, SubscriptionOptions, TypedDocumentNode } from '@apollo/client';
import { AbortableParams } from '../../core/types';

export enum ApiRequestAuthMode {
  Public = 'Public',
  Private = 'Private',
  Authenticator = 'Authenticator'
}

export enum GraphQlOperationType {
  Query = 'Query',
  Mutation = 'Mutation',
  Subscription = 'Subscription'
}

/**
 * Pointer towards Apollo query / mutation / subscription options objects,
 * depending on the provided TType generic argument.
 */
export type GraphQlClientOptions<
  TType extends GraphQlOperationType = GraphQlOperationType,
  TData = any,
  TVars extends OperationVariables = OperationVariables> =
  TType extends GraphQlOperationType.Query ? QueryOptions<TVars, TData> | null :
  TType extends GraphQlOperationType.Mutation ? MutationOptions<TVars, TData> | null :
  TType extends GraphQlOperationType.Subscription ? SubscriptionOptions<TVars, TData> | null :
  never;

export type GraphQlRequestDocumentParams<
  TType extends GraphQlOperationType = GraphQlOperationType,
  TData = any,
  TVars extends OperationVariables = OperationVariables> =
  TType extends GraphQlOperationType.Query | GraphQlOperationType.Subscription ? {
    query: DocumentNode | TypedDocumentNode<TData, TVars>;
    mutation?: never;
  } :
  TType extends GraphQlOperationType.Mutation ? {
    query?: never;
    mutation: DocumentNode | TypedDocumentNode<TData, TVars>;
  } :
  never;

export type GraphQlOperationBaseParams<
  TData = any,
  TVars extends OperationVariables = OperationVariables> =
  AbortableParams &
  {
    variables?: TVars | null;
    authMode?: ApiRequestAuthMode | null;
    token?: string | null;
  }

export type GraphQlQueryParams<
  TData = any,
  TVars extends OperationVariables = OperationVariables> =

  GraphQlOperationBaseParams<TData, TVars> & {
    query: DocumentNode | TypedDocumentNode<TData, TVars>;
    clientOptions?: QueryOptions | null;
  }

export type GraphQlMutationParams<
  TData = any,
  TVars extends OperationVariables = OperationVariables> =

  GraphQlOperationBaseParams<TData, TVars> & {
    mutation: DocumentNode | TypedDocumentNode<TData, TVars>;
    clientOptions?: MutationOptions | null;
  }

export type GraphQlSubscriptionParams<
  TData = any,
  TVars extends OperationVariables = OperationVariables> =

  GraphQlOperationBaseParams<TData, TVars> & {
    query: DocumentNode | TypedDocumentNode<TData, TVars>;
    clientOptions?: MutationOptions | null;
  }

export type GraphQlOperationParams<
  TData = any,
  TVars extends OperationVariables = OperationVariables> =

  GraphQlQueryParams<TData, TVars> |
  GraphQlMutationParams<TData, TVars> |
  GraphQlSubscriptionParams<TData, TVars>;