import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { AuthFlowResponse, AuthFlowResponseType } from '../../services/auth/authSchema';
import { Navigate } from 'react-router-dom';
import { useKernel } from '../../kernel/kernelHooks';
import { Error } from '../../errors/error';
import { trace } from '../../dev';
import { DevRuntime } from '../../dev/devRuntime';
import { Routes } from '../../routes/routes';
import { BackdropPage } from '../../pages/backdrop/backdropPage';

type Props = {
  response?: AuthFlowResponse | null;
  error?: Error | null;
}

export const AuthFlowResponseInterpreter = observer(({
  response,
  error
}: Props) => {

  trace(DevRuntime, `AuthFlowResponseInterpreter render()`, { response, error });

  const kernel = useKernel();
  const { routingService, notificationService } = kernel;

  const responseType: AuthFlowResponseType | null = response?.responseType ?? null;
  const responseError: Error | null = response?.error ?? null;

  useEffect(() => {
    if (responseError)
      notificationService.notifyError(responseError.message);
  }, [responseError, notificationService]);

  if (error)
    return <div>An error has occurred.</div>

  if (!response)
    return <BackdropPage />;

  switch (responseType) {
    case AuthFlowResponseType.RedirectToLoginPage:
      return <Navigate to={Routes.login()} />

    case AuthFlowResponseType.RedirectAfterLogout:
    case AuthFlowResponseType.RedirectToLastContentRoute: {
      const redirectPath = routingService.getRedirectRouteFromAuthFlowResponse(response) ?? '/';
      return <Navigate to={redirectPath} />;
    }

    case AuthFlowResponseType.AwaitRedirect:
      return <BackdropPage />;
  }

  return <div>The response type {responseType} should not be used with the interpreter</div>
});