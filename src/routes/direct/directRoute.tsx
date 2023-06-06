import { PropsWithChildren } from 'react';
import { observer } from 'mobx-react-lite';

type Props = PropsWithChildren<{}>;

/**
 * Adds to a page a direct route behavior.
 * The page will be rendered as is, without any kind of additional logic.
 */
export const DirectRoute = observer((props: Props) => {

  return <>{props.children}</>;
});