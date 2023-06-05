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
 * Wrapper around a GraphQL subscription run using Apollo. 
 * Handles everything regarding authentication, network connectivity, debugging, etc.
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

  readonly id = nanoid();

  readonly client: ApolloClient<NormalizedCacheObject>;
  readonly params: GraphQlSubscriptionParams<TData, TVars>;

  get query(): DocumentNode | TypedDocumentNode<TData, TVars> {
    return this.params.query;
  }

  get variables(): TVars | null {
    return this.params.variables ?? null;
  }

  get operationName(): string | null {
    return getGraphQlOperationName(this.query);
  }

  observable: Observable<TData> | null = null;

  private subscription: Subscription | null = null;

  private iterableRelay = new AsyncIterableRelay<TData>();

  get iterable(): AsyncIterable<TData> {
    return this.iterableRelay.iterable;
  }

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

  stop() {
    this.subscription?.unsubscribe();
    this.subscription = null;

    this.observable = null;
  }
}