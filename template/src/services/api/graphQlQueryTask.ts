import { ApolloClient, DocumentNode, NormalizedCacheObject, OperationVariables, TypedDocumentNode } from '@apollo/client';
import { nanoid } from 'nanoid';
import { AsyncResult } from '../../core/types';
import { initDev, trace } from '../../dev';
import { Kernel } from '../../kernel/kernel';
import { GraphQlQueryParams } from './apiSchema';
import { BaseTask } from '../../tasks/baseTask';
import { getGraphQlOperationName, runGraphQlQuery } from './graphQlHelpers';

type Props<
  TData = any,
  TVars extends OperationVariables = OperationVariables> = GraphQlQueryParams<TData, TVars> & {
    client: ApolloClient<NormalizedCacheObject>
  };

/** 
 * Wrapper around a GraphQL request made using Apollo. 
 * Handles everything regarding authentication, network connectivity, debugging, etc.
 */
export class GraphQlQueryTask<
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
  readonly params: GraphQlQueryParams<TData, TVars>;

  get query(): DocumentNode | TypedDocumentNode<TData, TVars> {
    return this.params.query;
  }
  
  get variables(): TVars | null {
    return this.params.variables ?? null;
  }

  get operationName(): string | null {
    return getGraphQlOperationName(this.query);
  }

  protected async executor(): AsyncResult<TData> {
    return runGraphQlQuery(this, this.client, this.params);
  }
}