import { observer } from 'mobx-react-lite';
import { Backdrop } from '../../components/backdrop/backdrop';

export const BackdropPage = observer(() => {

  return (
    <div className="backdrop-page">
      <Backdrop />
    </div>
  );
});