import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Error } from '../../errors/error';
import { useKernel } from '../../kernel/kernelHooks';
import { Routes } from '../../routes/routes';
import { AuthFlowResponse, AuthFlowResponseType } from '../../services/auth/authSchema';
import { BackdropPage } from '../../pages/backdrop/backdropPage';

import { DevRuntime } from '../../dev/devRuntime';
import { trace } from '../../dev';

type Props = {
  response?: AuthFlowResponse | null;
  error?: Error | null;
}

/**
 * Receives the response of an authentication flow
 * and applies the appropriate UI updates, including displaying errors,
 * loading masks, redirecting, etc.
 */
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