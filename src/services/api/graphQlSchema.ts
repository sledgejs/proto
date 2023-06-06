import { DocumentNode, MutationOptions, OperationVariables, QueryOptions, TypedDocumentNode } from '@apollo/client';
import { AbortableParams } from '../../core/types';
import { ApiRequestAuthMode } from './apiSchema';

/**
 * Shared parameters for initializing and running all types of GraphQL operations.
 * @typeParam TData The type of the data returned by the operation.
 * @typeParam TVars The type of the variables passed to the operation.
 */
export type GraphQlOperationBaseParams<
  TData = any,
  TVars extends OperationVariables = OperationVariables> =
  AbortableParams &
  {
    variables?: TVars | null;
    authMode?: ApiRequestAuthMode | null;
    token?: string | null;
  }

/**
 * Parameters for initializing and running a GraphQL query.
 * @typeParam TData - The type of the data returned by the query.
 * @typeParam TVars - The type of the variables passed to the query.
 */
export type GraphQlQueryParams<
  TData = any,
  TVars extends OperationVariables = OperationVariables> =

  GraphQlOperationBaseParams<TData, TVars> & {
    query: DocumentNode | TypedDocumentNode<TData, TVars>;
    clientOptions?: QueryOptions | null;
  }

/**
 * Parameters for initializing and running a GraphQL mutation.
 * @typeParam TData The type of the data returned by the mutation.
 * @typeParam TVars The type of the variables passed to the mutation.
 */
export type GraphQlMutationParams<
  TData = any,
  TVars extends OperationVariables = OperationVariables> =

  GraphQlOperationBaseParams<TData, TVars> & {
    mutation: DocumentNode | TypedDocumentNode<TData, TVars>;
    clientOptions?: MutationOptions | null;
  }

/**
 * Parameters for initializing and running a GraphQL subscription.
 * @typeParam TData The type of the data returned by the subscription.
 * @typeParam TVars The type of the variables passed to the subscription.
 */
export type GraphQlSubscriptionParams<
  TData = any,
  TVars extends OperationVariables = OperationVariables> =

  GraphQlOperationBaseParams<TData, TVars> & {
    query: DocumentNode | TypedDocumentNode<TData, TVars>;
    clientOptions?: MutationOptions | null;
  }

/**
 * Union type for representing all parameters for initializing and running a GraphQL operation.
 * @typeParam TData The type of the data returned by the operation.
 * @typeParam TVars The type of the variables passed to the operation.
 */
export type GraphQlOperationParams<
  TData = any,
  TVars extends OperationVariables = OperationVariables> =

  GraphQlQueryParams<TData, TVars> |
  GraphQlMutationParams<TData, TVars> |
  GraphQlSubscriptionParams<TData, TVars>;