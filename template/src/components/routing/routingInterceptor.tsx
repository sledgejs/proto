import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useKernel } from '../../kernel/kernelHooks';
import { RouteAction } from '../../routes/routeSchema';

export const RoutingInterceptor = observer(() => {

  const location = useLocation();
  const navigationType = useNavigationType();

  const kernel = useKernel();
  const { routingService } = kernel;

  useEffect(() => {

    const action: RouteAction = (() => {
      switch (navigationType) {
        case 'REPLACE': return RouteAction.Replace;
        case 'POP': return RouteAction.Pop;
        case 'PUSH': return RouteAction.Push;
      }

      return RouteAction.Push;
    })();

    routingService.registerVisit(location, action);
    
  }, [location, navigationType, routingService]);

  return null;
});