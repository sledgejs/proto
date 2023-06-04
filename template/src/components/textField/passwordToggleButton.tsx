import React, { ButtonHTMLAttributes } from 'react';
import { observer } from 'mobx-react-lite';
import { Eye, EyeSlash } from 'phosphor-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Toggle from '@radix-ui/react-toggle';
import { InputProps, InputRole, OmitInputProps } from '../form/inputSchema';
import { useInputController } from '../form/inputController';

import { trace } from '../../dev';

type Props = OmitInputProps<ButtonHTMLAttributes<{}>> & InputProps;

export const PasswordToggleButton = observer(({
  role,
  ...props
}: Props) => {

  const { model } = useInputController({
    role: InputRole.CheckBox,
    component: PasswordToggleButton,
    ...props
  });

  trace(model, 'render()');

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild={true} >
        <div>
          <Toggle.Root className="password-toggle-btn input-decoration-btn" onClick={model.handleClick}>
            {model.isChecked ?
              <Eye /> :
              <EyeSlash />}
          </Toggle.Root>
        </div>
      </Tooltip.Trigger>

      <Tooltip.Portal>
        <Tooltip.Content className="tooltip" onPointerDownOutside={evt => evt.preventDefault()}>
          {model.isChecked ? 'Hide password' : 'Show password'}
          <Tooltip.Arrow className="tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
});