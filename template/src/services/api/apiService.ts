import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, InMemoryCacheConfig, NormalizedCacheObject, Observable, OperationVariables, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';
import { GraphQlMutationParams, GraphQlQueryParams, GraphQlSubscriptionParams } from './graphQlSchema';
import { AsyncResult } from '../../core/types';
import { GraphQlSubscription } from './graphQlSubscription';
import { GraphQlMutationTask } from './graphQlMutationTask';
import { GraphQlQueryTask } from './graphQlQueryTask';
import { trace } from '../../dev';
import { Config } from '../../config/config';
import { Kernel } from '../../kernel/kernel';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const ServiceConfig = Config.api;
const GraphQlConfig = ServiceConfig.graphql;
const ApolloConfig = ServiceConfig.apollo;

/**
 * Handles API connectivity and communicates with the `AuthService` to obtain tokens and refresh the AuthContext if it expires. 
 * The current implementation is for GraphQL and supports queries, mutations and subscription. 
 * There is also support for file uploads with progress monitoring.
 */
export class ApiService
  extends ServiceBase {

  readonly serviceName = ServiceName.Api;

  constructor(kernel: Kernel) {
    super(kernel);

    const cache = this.createApolloCache();
    this.cache = cache;

    this.client = this.createApolloClient();

    this.runAuthStateSyncLoop();
  }

  /**
   * Reference to the Apollo cache instance.
   */
  cache: InMemoryCache;

  /**
   * Reference to the Apollo client instance.
   */
  client: ApolloClient<NormalizedCacheObject>;

  /**
   * Returns true if subscriptions can be used.
   * In the current implementation this means that the service is authorized
   * and a token has been set.
   */
  get canUseSubscriptions() {
    return !!this.token;
  }

  private get token(): string | null {

    const authState = this.kernel.authService.stateManager.state;
    const authContext = authState.context;
    const token = authContext?.permit?.token ?? null;

    if (authState.isAuthorized && authContext?.isAuthenticated)
      return token;

    return null;
  }

  private async runAuthStateSyncLoop() {
    const { stateManager } = this.kernel.authService;
    for await (const state of stateManager.stateIterable) {
      this.createApolloClient();
    }
  }

  private createApolloCache() {

    const cacheConfig: InMemoryCacheConfig = {

    }

    const cache = new InMemoryCache(cacheConfig);
    return cache;
  }

  private createApolloLink(): ApolloLink {

    // add support for both HTTP and WebSockets using the Apollo Link functionality
    // see https://www.apollographql.com/docs/react/data/subscriptions
    const wsClient = createClient({
      url: Config.api.graphql.subscriptionsEndpointUrl,
    });
    const wsLink = new GraphQLWsLink(wsClient);

    const httpLink = new HttpLink({
      uri: Config.api.graphql.endpointUrl
    });

    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    );

    return splitLink;
  }

  private createApolloClient() {

    const cache = this.cache;
    const link = this.createApolloLink();

    const client = new ApolloClient({
      uri: GraphQlConfig.endpointUrl,
      name: ApolloConfig.clientName,
      version: ApolloConfig.clientVersion,

      cache,
      link,
      queryDeduplication: false,
      connectToDevTools: import.meta.env.NODE_ENV !== 'production',

      defaultOptions: {
        query: {
          fetchPolicy: ApolloConfig.enableCache ? 'cache-first' : 'no-cache',
        },
        watchQuery: {
          fetchPolicy: ApolloConfig.enableCache ? 'cache-and-network' : 'no-cache',
        }
      }
    });

    trace(this, `Created ApolloClient`);

    this.client = client;
    return client;
  }

  /**
   * Creates a GraphQL query task using the provided options.
   * This method does not run the task, it only returns it.
   * 
   * @typeParam TData The type of the data returned by the query.
   * @typeParam TVars The type of the variables passed to the query.
   */
  query<TData = any, TVars extends OperationVariables = OperationVariables>(
    options: GraphQlQueryParams<TData, TVars>)
    : GraphQlQueryTask<TData, TVars> {

    const task = new GraphQlQueryTask(this.kernel, {
      ...options,
      client: this.client
    });

    return task;
  }

  /**
   * Creates a GraphQL query task using the provided options, 
   * runs it and returns its result.
   * 
   * @typeParam TData The type of the data returned by the query.
   * @typeParam TVars The type of the variables passed to the query.
   */
  async runQuery<TData = any, TVars extends OperationVariables = OperationVariables>(
    options: GraphQlQueryParams<TData, TVars>): AsyncResult<TData> {

    const task = this.query(options);
    return task.run();
  }

  /**
   * Creates a GraphQL mutation task using the provided options.
   * This method does not run the mutation, it only returns it.
   * 
   * @typeParam TData The type of the data returned by the mutation.
   * @typeParam TVars The type of the variables passed to the mutation.
   */
  mutation<TData = any, TVars extends OperationVariables = OperationVariables>(
    options: GraphQlMutationParams<TData, TVars>)
    : GraphQlMutationTask<TData, TVars> {

    const task = new GraphQlMutationTask(this.kernel, {
      ...options,
      client: this.client,
    });

    return task;
  }

  /**
   * Creates a GraphQL mutation task using the provided options, 
   * runs it and returns its result.
   * 
   * @typeParam TData The type of the data returned by the mutation.
   * @typeParam TVars The type of the variables passed to the mutation.
   */
  async runMutation<TData = any, TVars extends OperationVariables = OperationVariables>(
    options: GraphQlMutationParams<TData, TVars>)
    : AsyncResult<TData> {

    const task = this.mutation(options);
    return task.run();
  }

  /**
   * Creates a GraphQL subscription object using the provided options.
   * This method does not start the subscription, it only returns it.
   * 
   * @typeParam TData The type of the data emitted by the subscription.
   * @typeParam TVars The type of the variables passed to the subscription.
   */
  subscription<TData = any, TVars extends OperationVariables = OperationVariables>(
    options: GraphQlSubscriptionParams<TData, TVars>)
    : GraphQlSubscription<TData, TVars> {

    const subscription = new GraphQlSubscription(this.kernel, {
      ...options,
      client: this.client,
    });

    return subscription;
  }

  /**
   * Creates a GraphQL subscription object using the provided options, 
   * starts it and returns the `Observable` associated with the subscription.
   * 
   * @typeParam TData The type of the data emitted by the subscription.
   * @typeParam TVars The type of the variables passed to the subscription.
   */
  async startSubscription<TData = any, TVars extends OperationVariables = OperationVariables>(
    options: GraphQlSubscriptionParams<TData, TVars>)
    : AsyncResult<Observable<TData>> {

    const subscription = this.subscription(options);
    return subscription.start();
  }

  /**
   * Evicts the Apollo cache.
   */
  evictCache() {
    this.cache.evict({});
  }

  /**
   * Recreates the Apollo client in order to keep it synchronized
   * with the authentication state.
   */
  syncClient() {
    this.client.stop();
    this.client = this.createApolloClient();
  }
}