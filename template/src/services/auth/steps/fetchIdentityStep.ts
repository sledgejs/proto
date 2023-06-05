import type { AsyncResult } from '../../../core/types';
import type { AuthOrchestrator } from '../authOrchestrator';
import { AuthPermit } from '../authPermit';
import { Error } from '../../../errors/error';
import { UserIdentity } from '../userIdentity';
import { gql } from '@apollo/client';
import { AuthFetchIdentityStepQuery, User } from '../../../.generated/graphql';
import { ApiRequestAuthMode } from '../../api/apiSchema';
import { GraphQlQueryParams } from '../../api/graphQlSchema';
import { ErrorCode } from '../../../errors/errorCode';
import { EntitySource } from '../../../data/entitySchema';

type Params = {
  orchestrator: AuthOrchestrator;
  permit: AuthPermit;
}

export async function runFetchIdentityStep(params: Params): AsyncResult<UserIdentity> {

  const { permit, orchestrator } = params;
  const { kernel, abortSignal } = orchestrator;

  if (abortSignal?.aborted)
    return [null, new Error(ErrorCode.Aborted)];

  // validate the permit, and if everything is ok, set it locally
  if (!permit || !permit.isValid)
    return [null, new Error('Auth.InvalidPermit')];

  const query = gql`
  query authFetchIdentityStep {
    getIdentity {
      # TODO: replace with fragment
      id
      username
      firstName
      lastName
    }
  }`;

  const token = permit.token;

  const reqOpts: GraphQlQueryParams = {
    query,
    token,
    authMode: ApiRequestAuthMode.Authenticator,
    abortSignal
  };

  const [res, err] = await kernel.apiService.runQuery<AuthFetchIdentityStepQuery>(reqOpts);

  const resObj = res?.getIdentity as EntitySource<User>;

  if (err || !resObj) {
    return [null, new Error('Auth.FetchIdentityError', {
      message: err?.message || 'Could not fetch the identity information.',
      source: err
    })];
  }

  const profile = new UserIdentity(kernel, {
    ...resObj
  });

  return [profile];
}
