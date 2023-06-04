import { observer } from 'mobx-react-lite';
import { Navigate } from 'react-router-dom';
import { Routes } from '../../routes/routes';

export const DefaultPage = observer(() => {
  return (
    <Navigate to={Routes.dashboard()} />
  );
});

export default DefaultPage;