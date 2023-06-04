import { PropsWithChildren } from 'react';
import { observer } from 'mobx-react-lite';

type Props = PropsWithChildren<{}>;

export const DirectRoute = observer((props: Props) => {

  return <>{props.children}</>;
});