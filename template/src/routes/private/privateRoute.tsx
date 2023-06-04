import { PropsWithChildren } from 'react';
import { observer } from 'mobx-react-lite';
import { useModel, useModelBindings } from '../../components/componentHooks';
import { AuthFlowResponseType } from '../../services/auth/authSchema';
import { AuthFlowResponseInterpreter } from '../../components/auth/authFlowResponseInterpreter';
import { PrivateRouteState } from './privateRouteState';
import { BackdropPage } from '../../pages/backdrop/backdropPage';

import { trace } from '../../dev';

type Props = PropsWithChildren<{}>;

export const PrivateRoute = observer((props: Props) => {

  const model = useModel((kernel) => new PrivateRouteState(kernel));
  useModelBindings(model);

  trace(model, 'render()', { props, model });

  const { flowResponse } = model;
  if (model.isLoading)
    return <BackdropPage />

  switch (flowResponse?.responseType) {
    case AuthFlowResponseType.PassThroughPrivateRoute:
      return <>{props.children}</>;

    default:
      return (
        <AuthFlowResponseInterpreter
          response={flowResponse}
          error={model.error} />
      );
  }
});