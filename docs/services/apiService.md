# Services / ApiService
Handles API connectivity and communicates with the `AuthService` to obtain tokens and refresh the AuthContext if it expires. The current implementation is for GraphQL and supports queries, mutations and subscription. There is also support for file uploads with progress monitoring.

The public interface of `ApiService` is the following:

```ts
interface ApiService 
  extends IService {

  query<TData, TVars>(options: GraphQlQueryParams<TData, TVars>)
    : GraphQlQueryTask<TData, TVars>;

  async runQuery<TData, TVars>(options: GraphQlQueryParams<TData, TVars>)
    : AsyncResult<TData>;

  mutation<TData, TVars>(options: GraphQlMutationParams<TData, TVars>)
    : GraphQlMutationTask<TData, TVars>;

  async runMutation<TData, TVars>(options: GraphQlMutationParams<TData, TVars>)
    : AsyncResult<TData>;

  subscription<TData, TVars>(options: GraphQlSubscriptionParams<TData, TVars>)
    : GraphQlSubscription<TData, TVars>;

  async startSubscription<TData, TVars>(options: GraphQlSubscriptionParams<TData, TVars>)
    : AsyncResult<Observable<TData>>;

  evictCache() {
    this.cache.evict({});
  }

  syncClient() {
    this.client.stop();
    this.client = this.createApolloClient();
  }
}
```

The `query`, `mutation` and `subscription` methods just create the appropriate task or subscription object but does not run or start them. To directly run and obtain the result of the operation use `runQuery`, `runMutation` or `runSubscription`.

The current implementation uses the Apollo client behind the scenes and is responsible for creating the client and syncing it with the `AuthService` when needed.

The `GraphQlQueryTask` and `GraphQlMutationTask` classes are light implementations of `BaseTask` which call a helper method for running the query. 

The `GraphQlSubscription` class serves the same purpose as a task, but has a slightly different structure due to the event-based nature of subscriptions. In the future this behavior will be standardized.