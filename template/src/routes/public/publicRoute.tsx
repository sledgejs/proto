import { PropsWithChildren } from 'react';
import { observer } from 'mobx-react-lite';
import { useModel, useModelBindings } from '../../components/componentHooks';
import { PublicRouteState } from './publicRouteState';
import { AuthFlowResponseType } from '../../services/auth/authSchema';
import { AuthFlowResponseInterpreter } from '../../components/auth/authFlowResponseInterpreter';
import { BackdropPage } from '../../pages/backdrop/backdropPage';

import { trace } from '../../dev';

type Props = PropsWithChildren<{}>;

export const PublicRoute = observer((props: Props) => {

  const model = useModel(kernel =>
    new PublicRouteState(kernel));
  useModelBindings(model);

  trace(model, { props, model });

  const { flowResponse } = model;
  if (model.isLoading)
    return <BackdropPage />

  switch (flowResponse?.responseType) {
    case AuthFlowResponseType.PassThroughPublicRoute:
      return <>{props.children}</>;

    default:
      return (
        <AuthFlowResponseInterpreter
          response={flowResponse}
          error={model.error} />
      );
  }
});