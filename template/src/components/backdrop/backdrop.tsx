import './backdrop.scss';

import { HTMLAttributes, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { ComponentSizeKey } from '../componentSchema';
import classNames from 'classnames';
import { SpinnerGap } from 'phosphor-react';

type Props = HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
  spinner?: ReactNode;
  message?: ReactNode;
  size?: ComponentSizeKey;
}

export const Backdrop = observer(({
  open = false,
  message,
  size,
  className
}: Props) => {

  className = classNames('backdrop', size, className);

  return (
    <div className={className}
      hidden={!open}
      aria-hidden={!open}>

      <div className="animation">
        <SpinnerGap size={32} weight="bold" />
      </div>

      {message &&
        <div className="message">{message}</div>}
    </div>
  );
});