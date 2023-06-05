import { ApolloClient, DocumentNode, NormalizedCacheObject, OperationVariables, TypedDocumentNode } from '@apollo/client';
import { nanoid } from 'nanoid';
import { AsyncResult } from '../../core/types';
import { Kernel } from '../../kernel/kernel';
import { BaseTask } from '../../tasks/baseTask';
import { GraphQlMutationParams } from './graphQlSchema';
import { getGraphQlOperationName, runGraphQlMutation } from './graphQlHelpers';

import { initDev, trace } from '../../dev';

type Props<
  TData = any,
  TVars extends OperationVariables = OperationVariables> = GraphQlMutationParams<TData, TVars> & {
    client: ApolloClient<NormalizedCacheObject>
  };

/** 
 * Wrapper around a GraphQL request made using Apollo. 
 * Handles everything regarding authentication, network connectivity, debugging, etc.
 */
export class GraphQlMutationTask<
  TData = any,
  TVars extends OperationVariables = OperationVariables>

  extends BaseTask<TData> {

  constructor(kernel: Kernel, props: Props<TData, TVars>) {
    super(kernel, props);

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
  readonly params: GraphQlMutationParams<TData, TVars>;

  get mutation(): DocumentNode | TypedDocumentNode<TData, TVars> {
    return this.params.mutation;
  }
  
  get variables(): TVars | null {
    return this.params.variables ?? null;
  }

  get operationName(): string | null {
    return getGraphQlOperationName(this.mutation);
  }

  protected async executor(): AsyncResult<TData> {
    return runGraphQlMutation(this, this.client, this.params);
  }
}