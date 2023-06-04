import { type PropsWithChildren } from 'react';
import { observer } from 'mobx-react-lite';
import { AuthFlowResponseType } from '../../services/auth/authSchema';
import { AuthFlowResponseInterpreter } from '../../components/auth/authFlowResponseInterpreter';
import { useModel, useModelBindings } from '../../components/componentHooks';
import { BackdropPage } from '../../pages/backdrop/backdropPage';
import { AuthRouteState } from './authRouteState';

import { trace } from '../../dev';

type Props = PropsWithChildren<{}>;

export const AuthRoute = observer((props: Props) => {

  const model = useModel((kernel) => new AuthRouteState(kernel));
  useModelBindings(model);

  trace(model, { props, model });

  const { flowResponse } = model;
  if (model.isLoading)
    return <BackdropPage />

  switch (flowResponse?.responseType) {
    case AuthFlowResponseType.PassThroughAuthRoute:
      return <>{props.children}</>;

    default:
      return (
        <AuthFlowResponseInterpreter
          response={flowResponse}
          error={model.error} />
      );
  }
});