import { ApolloClient, ApolloError, ApolloQueryResult, DefaultContext, DocumentNode, FetchResult, MutationOptions, NormalizedCacheObject, Observable, OperationVariables, QueryOptions, ServerError, SubscriptionOptions } from '@apollo/client';
import { OperationDefinitionNode } from 'graphql';
import { AsyncResult, Maybe, Result } from '../../core/types';
import { Error } from '../../errors/error';
import { GraphQlMutationParams, GraphQlOperationParams, GraphQlQueryParams, GraphQlSubscriptionParams } from './graphQlSchema';
import { ApiRequestAuthMode } from './apiSchema';
import { ApiRequestExecutor, ApiRequestExecutorParams } from './apiInteropSchema';
import { AuthStateMediator } from '../auth/authStateMediator';
import { Node } from '../../kernel/node';
import { runApiRequest } from './apiRequestHelpers';
import { RouteType } from '../../routes/routeSchema';

import { trace } from '../../dev';

/**
 * Executes a GraphQL query using the provided arguments.
 * 
 * @param target  The object which owns this method call.
 *                Used for diagnostics and to access the {@link Kernel}.
 * @param client  The ApolloClient instance to use for executing the query.
 * @param params  The parameters of the query.
 * 
 * @typeParam TData The type of the data returned by the query.
 * @typeParam TVars The type of the variables passed to the query.
 */
export async function runGraphQlQuery<
  TData = any,
  TVars extends OperationVariables = OperationVariables>(
    target: Node,
    client: ApolloClient<NormalizedCacheObject>,
    params: GraphQlQueryParams<TData, TVars>): AsyncResult<TData> {

  const executor: ApiRequestExecutor<TData> = async (resolvedParams) => {

    const options: QueryOptions = {
      ...getGraphQlBaseOptions(params, resolvedParams),
      query: params.query
    }

    try {
      return decodeResult(await client.query(options));
    } catch (rawErr) {
      return decodeResult(null, rawErr);
    }
  }

  return runGraphQlOperation(target, executor, params);
}

/**
 * Executes a GraphQL mutation using the provided arguments.
 * 
 * @param target  The object which owns this method call.
 *                Used for diagnostics and to access the {@link Kernel}.
 * @param client  The ApolloClient instance to use for executing the mutation.
 * @param params  The parameters of the mutation.
 * 
 * @typeParam TData The type of the data returned by the mutation.
 * @typeParam TVars The type of the variables passed to the mutation.
 */
export async function runGraphQlMutation<
  TData = any,
  TVars extends OperationVariables = OperationVariables>(
    target: Node,
    client: ApolloClient<NormalizedCacheObject>,
    params: GraphQlMutationParams<TData, TVars>): AsyncResult<TData> {

  const executor: ApiRequestExecutor<TData> = async (resolvedParams) => {

    const options: MutationOptions = {
      ...getGraphQlBaseOptions(params, resolvedParams),
      mutation: params.mutation
    }

    const result = await client.mutate(options);

    const { errors } = result;
    if (Array.isArray(errors) && errors.length > 0) {

      const hasUnauthorizedError = errors.some(err => {
        const serverError = (err as ApolloError).networkError as ServerError;
        return serverError.statusCode === 401
      });

      if (hasUnauthorizedError)
        return [null, new Error('Api.ProviderNotAuthorized')];

      return [null, new Error('Api.GraphQlError', { source: errors })];
    }

    return [result.data ?? true];
  }

  return runGraphQlOperation(target, executor, params);
}

/**
 * Starts a GraphQL subscription using the provided arguments and returns the
 * resulting `Observable` instance.
 * 
 * @param target  The object which owns this method call.
 *                Used for diagnostics and to access the {@link Kernel}.
 * @param client  The ApolloClient instance to use for creating the subscription.
 * @param params  The parameters of the subscription.
 * 
 * @typeParam TData The type of the data emitted by the subscription.
 * @typeParam TVars The type of the variables passed to the subscription.
 */
export async function runGraphQlSubscription<
  TData = any,
  TVars extends OperationVariables = OperationVariables>(
    target: Node,
    client: ApolloClient<NormalizedCacheObject>,
    params: GraphQlSubscriptionParams<TData, TVars>): AsyncResult<Observable<TData>> {

  const executor: ApiRequestExecutor<Observable<TData>> = async (resolvedParams) => {

    const options: QueryOptions = {
      ...getGraphQlBaseOptions(params, resolvedParams),
      query: params.query
    }

    const obs = client.subscribe(options);

    const dataObs = obs.map(fetchRes => fetchRes.data);

    return [dataObs];
  }

  return runGraphQlOperation(target, executor, params);
}

export function getGraphQlOperationName(doc: DocumentNode) {
  const opDef = doc.definitions.find(def => def.kind === 'OperationDefinition') as OperationDefinitionNode;
  if (opDef)
    return opDef.name?.value ?? null;

  return null;
}

export function getGraphQlBaseOptions(
  params: GraphQlOperationParams,
  resolvedParams: ApiRequestExecutorParams): BaseOptions {

  const context = getGraphQlOperationContext(resolvedParams);

  const baseOptions: BaseOptions = {
    ...params.clientOptions,
    variables: params.variables ?? undefined,
    context: context
  }

  return baseOptions;
}

async function runGraphQlOperation<TValue = any, TData = any, TVars extends OperationVariables = OperationVariables>(
  target: Node,
  executor: ApiRequestExecutor<TValue>,
  params: GraphQlOperationParams<TData, TVars>): AsyncResult<TValue> {

  let {
    abortSignal,
    authMode
  } = params;

  const mediator = new AuthStateMediator(target.kernel);

  if (!authMode) {
    // TODO: fix
    authMode = target.kernel.routingService.history.context.descriptor.routeType === RouteType.Public ?
      ApiRequestAuthMode.Public :
      ApiRequestAuthMode.Private;
  }

  const [res, err] = await runApiRequest({
    authMode,
    executor,
    mediator,
    abortSignal
  });

  if (err) {
    trace(target, `An error was returned by the director: `, err);
    return [null, err];
  }

  trace(target, `Task completed successfully with response: `, res);
  return [res];
}

function getGraphQlOperationContext(resolvedParams: Partial<ApiRequestExecutorParams>): DefaultContext {

  const {
    token,
    abortSignal
  } = resolvedParams;

  const context: DefaultContext = {
    authMode: 'test',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    fetchOptions: {
      signal: abortSignal
    }
  }

  return context;
}

type Options = QueryOptions | MutationOptions | SubscriptionOptions;
type BaseOptions = Omit<Options, 'query' | 'mutation' | 'fetchPolicy'> & {
  fetchPolicy?: any // TODO: find a fix 
};

function decodeResult<TData = any>(
  rawResult: Maybe<ApolloQueryResult<TData> | FetchResult<TData>>,
  rawError?: any): Result<TData> {

  if (rawError) {
    const err = decodeError(rawError);
    if (!err)
      return [null, new Error('Api.GraphQlError', { source: rawError })];

    return [null, err];
  }

  if (!rawResult)
    return [null, new Error('Api.MalformedResponse')];

  const maybeQueryResult = rawResult as ApolloQueryResult<TData>;
  const maybeFetchResult = rawResult as FetchResult<TData>;

  if (maybeQueryResult?.error)
    return [null, decodeError(maybeQueryResult.error)!];

  if (Array.isArray(rawResult.errors) && rawResult.errors.length > 0)
    // todo: move to decode
    return [null, new Error('Api.GraphQlError', { source: rawResult.errors })];

  return [rawResult.data!];
}

function decodeError(error: any): Error | null {
  if (!error)
    return null;

  const maybeApolloError = error as Maybe<ApolloError>;
  const maybeServerError = maybeApolloError?.networkError as Maybe<ServerError>;

  if (maybeServerError?.statusCode === 401)
    return new Error('Api.ProviderNotAuthorized', { source: error });

  return new Error('Api.GraphQlError', { source: error });
}