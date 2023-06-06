import { ApolloClient, DocumentNode, NormalizedCacheObject, Observable, OperationVariables, TypedDocumentNode } from '@apollo/client';
import { nanoid } from 'nanoid';
import type { Subscription } from 'zen-observable-ts';
import type { AsyncResult } from '../../core/types';
import { initDev, trace } from '../../dev';
import { Kernel } from '../../kernel/kernel';
import { Node } from '../../kernel/node';
import { GraphQlSubscriptionParams } from './graphQlSchema';
import { getGraphQlOperationName, runGraphQlSubscription } from './graphQlHelpers';
import { AsyncIterableRelay } from '../../core/async/asyncIterableRelay';

type Props<
  TData = any,
  TVars extends OperationVariables = OperationVariables> =
  GraphQlSubscriptionParams<TData, TVars> & {
    client: ApolloClient<NormalizedCacheObject>
  };

/** 
 * Wraps a GraphQL subscription in an object similar to a task.
 */
export class GraphQlSubscription<
  TData = any,
  TVars extends OperationVariables = OperationVariables>

  extends Node {

  constructor(kernel: Kernel, props: Props<TData, TVars>) {
    super(kernel);

    this.client = props.client;
    this.params = props;

    initDev(this, {
      instanceName: this.operationName,
      color: 'green'
    });
    trace(this);
  }

  private readonly client: ApolloClient<NormalizedCacheObject>;
  private readonly params: GraphQlSubscriptionParams<TData, TVars>;

  /**
   * Returns the query document of this subscription.
   */
  get query(): DocumentNode | TypedDocumentNode<TData, TVars> {
    return this.params.query;
  }

  /**
   * Returns the query variables of this subscription.
   */
  get variables(): TVars | null {
    return this.params.variables ?? null;
  }

  /**
   * Returns the operation name of this request.
   */
  get operationName(): string | null {
    return getGraphQlOperationName(this.query);
  }

  /**
   * Reference to an `Observable` instance which emits
   * the events received by the subscription.
   */
  observable: Observable<TData> | null = null;

  private subscription: Subscription | null = null;

  private iterableRelay = new AsyncIterableRelay<TData>();

  /**
   * Async iterable which yields each event emitted by the observable.
   */
  get iterable(): AsyncIterable<TData> {
    return this.iterableRelay.iterable;
  }

  /**
   * Starts the subscription and subscribes to its events.
   */
  async start(): AsyncResult<Observable<TData>> {
    const [observable, err] = await runGraphQlSubscription(this, this.client, this.params);
    if (err)
      return [null, err];

    this.observable = observable;

    const sub = observable.subscribe(data => {
      this.iterableRelay.next(data);
    });

    this.subscription = sub;

    return [observable];
  }

  /**
   * Stops the subscription and disposes of the associated resources.
   */
  stop() {
    this.subscription?.unsubscribe();
    this.subscription = null;

    this.observable = null;
  }
}