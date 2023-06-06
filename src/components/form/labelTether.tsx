import { PropsWithChildren } from 'react';
import { observer } from 'mobx-react-lite';
import { useLabelState } from './labelState';
import { LabelContext } from './labelContext';

type Props = PropsWithChildren<{}>;

export const LabelTether = observer(({
  children
}: Props) => {

  const model = useLabelState();

  return (
    <LabelContext.Provider value={model}>
      {children}
    </LabelContext.Provider>
  );
});