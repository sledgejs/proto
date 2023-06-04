import React, { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { paramCase } from 'change-case';
import { InputProps, InputRole, OmitInputProps } from '../form/inputSchema';
import { trace } from '../../dev';
import { useInputController } from '../form/inputController';
import { InputContext } from '../form/inputContext';
import { getInputAttributesFromProps } from '../form/inputUtils';
import { Warning, WarningCircle } from 'phosphor-react';

type Props =
  OmitInputProps<React.InputHTMLAttributes<{}>> &
  InputProps &
  {
    multiline?: boolean;
    password?: boolean;
    startDecoration?: ReactNode;
    endDecoration?: ReactNode;
  };

export type TextFieldProps = Props;

export const TextFieldComponent = observer(({
  id,
  className,
  multiline,
  type = 'text',
  hooks = [],
  modelRef,
  startDecoration,
  endDecoration,
  children,
  role,
  value,
  ...props
}: Props) => {

  const { model, id: controlledId } = useInputController({
    component: TextField,
    role: InputRole.TextField,
    id,
    hooks,
    modelRef,
    value,
    ...props
  });

  trace(model, 'render()');

  if (multiline) {
    return (
      <textarea
        className={className}
        {...getInputAttributesFromProps(props)}>
        {model.value ?? ''}
      </textarea>
    );
  }

  className = classNames('text-field input', className, {
    'with-start-decoration': !!startDecoration,
    'with-end-decoration': !!endDecoration,
    'error': model.showStatus && model.error
  });

  const inputClassName = classNames('text-field-native-input');

  return (
    <InputContext.Provider value={model}>
      <div className={className}
        aria-disabled={model.isDisabled}>

        <div className="start-decoration">
          {startDecoration}
        </div>

        <input
          ref={model.nativeInputRef}
          id={controlledId}
          data-testid={controlledId}
          form={model.parentForm?.formId ?? undefined}
          value={model.value ?? ''}
          className={inputClassName}
          type={type}
          disabled={model.isDisabled ?? undefined}
          onFocus={model.handleFocus}
          onBlur={model.handleBlur}
          onPointerEnter={model.handlePointerEnter}
          onPointerLeave={model.handlePointerLeave}
          onInvalid={model.handleInvalid}
          onChange={model.handleTextInputChange}
          {...getInputAttributesFromProps(props)} />

        <div className="end-decoration">
          {model.showStatus && model.error &&
            <div className="input-decoration-indicator error-indicator">
              <WarningCircle />
            </div>}

          {endDecoration}
        </div>
      </div>
    </InputContext.Provider>
  );
});

type DecorationProps = React.HTMLAttributes<{}>;

enum DecorationName {
  Start = 'Start',
  End = 'End',
}

export const TextField: TextField = Object.assign(TextFieldComponent, {
  [DecorationName.Start]: createDecoration(DecorationName.Start),
  [DecorationName.End]: createDecoration(DecorationName.End),
});

type TextField = React.FunctionComponent<Props> & {
  [key in DecorationName]: React.FunctionComponent<DecorationProps>;
}

export function createDecoration(loc: DecorationName): React.FunctionComponent {
  const baseClassName = 'field-' + paramCase(loc);

  return observer((props: DecorationProps) => {
    return (
      <div className={baseClassName} {...props}>
        {props.children}
      </div>
    );
  });
}

export const Decorations: Set<React.FunctionComponent> = new Set([
  TextField.Start,
  TextField.End,
]);