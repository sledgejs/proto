import { LabelHTMLAttributes, ReactNode, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { useLabelContext } from './labelContext';
import { LabelTether } from './labelTether';

type Props = LabelHTMLAttributes<{}> & {
  content?: ReactNode | null
};

const LabelRoot = observer(({
  id,
  className,
  htmlFor,
  children,
  content,
  ...props
}: Props) => {

  const contextModel = useLabelContext();

  const inputId = contextModel?.inputId ?? null;

  const defaultId = inputId ? inputId + '_label' : null;

  className = classNames('label', className);
  id = id ?? defaultId ?? undefined;
  htmlFor = htmlFor ?? inputId ?? undefined;
  children = content ?? children;

  useEffect(() => {
    contextModel?.setLabelId(id);
  }, [contextModel, id]);

  return (
    <label id={id}
      className={className}
      htmlFor={htmlFor}
      {...props}>
      {children}
    </label>
  );
});

export const Label = Object.assign(LabelRoot, {
  Root: LabelRoot,
  Tether: LabelTether
});