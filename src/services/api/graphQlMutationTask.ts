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
 * Task-based implementation of a GraphQL mutation.
 * 
 * @typeParam TData The type of the data returned by the mutation.
 * @typeParam TVars The type of the variables passed to the mutation.
 */
export class GraphQlMutationTask<
  TData = any,
  TVars extends OperationVariables = OperationVariables>

  extends BaseTask<TData> {

  constructor(kernel: Kernel, props: Props<TData, TVars>) {
    super(kernel, props);

    this.client = props.client;
    this.params = props;

    initDev(this);
    trace(this);
  }

  private readonly client: ApolloClient<NormalizedCacheObject>;
  private readonly params: GraphQlMutationParams<TData, TVars>;

  /**
   * Returns the mutation document of this request.
   */
  get mutation(): DocumentNode | TypedDocumentNode<TData, TVars> {
    return this.params.mutation;
  }
  
  /**
   * Returns the mutation variables of this request.
   */
  get variables(): TVars | null {
    return this.params.variables ?? null;
  }

  /**
   * Returns the operation name of this request.
   */
  get operationName(): string | null {
    return getGraphQlOperationName(this.mutation);
  }

  /**
   * Implementation of {@link BaseTask.executor} which runs the actual request.
   */
  protected async executor(): AsyncResult<TData> {
    return runGraphQlMutation(this, this.client, this.params);
  }
}