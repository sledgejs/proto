import { PropsWithChildren, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';

type Props = PropsWithChildren<{
  content?: ReactNode | null;
}>

export const RequiredLabelContent = observer(({
  content,
  children
}: Props) => {
  return (
    <>
      <span>{content ?? children}</span>
      <span className="required-indicator">*</span>
    </>
  );
});