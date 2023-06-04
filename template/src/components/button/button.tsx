import './button.scss';

import React, { forwardRef, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useInputController } from '../form/inputController';
import { InputProps, InputRole, OmitInputProps } from '../form/inputSchema';
import { InputContext } from '../form/inputContext';
import { getInputAttributesFromProps } from '../form/inputUtils';
import { getButtonRenderProps } from './buttonUtils';

type Props =
  OmitInputProps<React.ButtonHTMLAttributes<{}>> &
  InputProps &
  {
    asChild?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    tooltip?: ReactNode;
  };

export type ButtonProps = Props;

export const ForwardedRefButton = forwardRef(({
  id,
  className,
  disabled = false,
  type = 'button',
  role,
  startIcon,
  endIcon,
  tooltip,
  children,
  asChild = false,
  ...props
}: Props, ref: React.ForwardedRef<HTMLButtonElement>) => {

  const { model, id: controlledId } = useInputController({
    component: ForwardedRefButton,
    role: InputRole.Button,
    disabled: disabled,
    id,
    ...props
  });

  // DEV && trace(model, 'render()');

  const renderProps = getButtonRenderProps({
    className,
    startIcon,
    endIcon,
    children,
    ...props
  });

  let contentElem = (
    <button
      ref={ref}
      id={controlledId}
      form={model.parentForm?.formId ?? undefined}
      className={renderProps.className}
      type={type}
      disabled={model.isDisabled || undefined}
      {...getInputAttributesFromProps(props)}>

      {renderProps.children}
    </button>
  );

  if (tooltip) {

    contentElem = (
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild={true} >
          {contentElem}
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content className="tooltip" onPointerDownOutside={evt => evt.preventDefault()} sideOffset={4}>
            {tooltip}
            <Tooltip.Arrow className="tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return (
    <InputContext.Provider value={model}>
      {contentElem}
    </InputContext.Provider>
  );
});

ForwardedRefButton.displayName = 'Button';
export const Button = observer(ForwardedRefButton);