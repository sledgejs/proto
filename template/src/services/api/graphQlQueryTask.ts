import { ApolloClient, DocumentNode, NormalizedCacheObject, OperationVariables, TypedDocumentNode } from '@apollo/client';
import { nanoid } from 'nanoid';
import { AsyncResult } from '../../core/types';
import { initDev, trace } from '../../dev';
import { Kernel } from '../../kernel/kernel';
import { GraphQlQueryParams } from './graphQlSchema';
import { BaseTask } from '../../tasks/baseTask';
import { getGraphQlOperationName, runGraphQlQuery } from './graphQlHelpers';

type Props<
  TData = any,
  TVars extends OperationVariables = OperationVariables> = GraphQlQueryParams<TData, TVars> & {
    client: ApolloClient<NormalizedCacheObject>
  };

/** 
 * Task-based implementation of a GraphQL query.
 * 
 * @typeParam TData The type of the data returned by the query.
 * @typeParam TVars The type of the variables passed to the query.
 */
export class GraphQlQueryTask<
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
  private readonly params: GraphQlQueryParams<TData, TVars>;

  /**
   * Returns the query document of this request.
   */
  get query(): DocumentNode | TypedDocumentNode<TData, TVars> {
    return this.params.query;
  }
  
  /**
   * Returns the query variables of this request.
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
   * Implementation of {@link BaseTask.executor} which runs the actual request.
   */
  protected async executor(): AsyncResult<TData> {
    return runGraphQlQuery(this, this.client, this.params);
  }
}