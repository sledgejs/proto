import React, { Children, FunctionComponent, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { paramCase } from 'param-case';
import { InputHook } from './inputSchema';
import { FieldContext } from './fieldContext';
import { useFieldState } from './fieldState';
import { Label } from './label';
import { Memo } from '../memo/memo';
import { MemoType } from '../memo/memoSchema';
import { Error } from '../../errors/error';

type Props = React.HTMLAttributes<{}> & {
  label?: ReactNode | null;
  hooks?: InputHook[];
  noContent?: boolean | null;
  noStyle?: boolean | null;
};

type Field = React.FunctionComponent<Props> & {
  [key in DecorationName]: React.FunctionComponent<DecorationProps>;
}

const FieldComponent = observer(({
  className,
  label,
  noContent = false,
  noStyle = false,
  children,
  ...props
}: Props) => {

  const model = useFieldState();
  const { input } = model;

  const decorationsElem: ReactNode[] = [];
  const inputElem: ReactNode[] = [];

  const LabelContainer = Field.Top;
  const overridesLabelContainers = new Set([Field.Top, Field.TopLeft, Field.TopRight]);
  let overridesLabel = false;

  const MessageContainer = Field.Bottom;
  const overridesMessageContainers = new Set([Field.Bottom, Field.BottomLeft, Field.BottomRight]);
  let overridesMessage = false;

  Children.forEach(children, node => {
    if (React.isValidElement(node) && typeof node.type !== 'string' && Decorations.has(node.type as FunctionComponent)) {
      if (overridesLabelContainers.has(node.type as FunctionComponent))
        overridesLabel = true;

      if (overridesMessageContainers.has(node.type as FunctionComponent))
        overridesMessage = true;

      decorationsElem.push(node);
    } else
      inputElem.push(node);
  });

  let showMessage = false;
  let messageContent: ReactNode | Error = null;
  let messageType: MemoType | null = null;

  if (input && input.error && input.showMessage) {
    showMessage = true;
    messageContent = input.error;
    messageType = MemoType.Error;
  }

  className = classNames('input-field', className, {

  });

  if (!noStyle) {
    className = classNames(className, 'vsp-tiny');
  }

  const showLabelContainer = !overridesLabel && !noContent;
  const showMessageContainer = !overridesMessage && !noContent && showMessage;

  return (
    <FieldContext.Provider value={model}>
      <Label.Tether>
        <div className={className} {...props}>
          <div className="field-input">
            {inputElem}
          </div>

          {showLabelContainer &&
            <LabelContainer>
              <Label>{label}</Label>
            </LabelContainer>}

          {showMessageContainer &&
            <MessageContainer>
              <Memo
                type={messageType}
                content={messageContent} />
            </MessageContainer>}

          {decorationsElem}
        </div>
      </Label.Tether>
    </FieldContext.Provider>
  );
});

type DecorationProps = React.HTMLAttributes<{}>;

enum DecorationName {
  Top = 'Top',
  TopLeft = 'TopLeft',
  TopRight = 'TopRight',
  Bottom = 'Bottom',
  BottomLeft = 'BottomLeft',
  BottomRight = 'BottomRight',
  Left = 'Left',
  Right = 'Right'
}

function createDecoration(loc: DecorationName): React.FunctionComponent {
  const baseClassName = 'field-' + paramCase(loc);

  return observer((props: DecorationProps) => {
    return (
      <div className={baseClassName} {...props}>
        {props.children}
      </div>
    );
  });
}

/**
 * Renders additional components alongside an input, like the label, validation and
 * information messages, and any custom components you want.
 */
export const Field: Field = Object.assign(FieldComponent, {
  [DecorationName.Top]: createDecoration(DecorationName.Top),
  [DecorationName.TopLeft]: createDecoration(DecorationName.TopLeft),
  [DecorationName.TopRight]: createDecoration(DecorationName.TopRight),
  [DecorationName.Bottom]: createDecoration(DecorationName.Bottom),
  [DecorationName.BottomLeft]: createDecoration(DecorationName.BottomLeft),
  [DecorationName.BottomRight]: createDecoration(DecorationName.BottomRight),
  [DecorationName.Left]: createDecoration(DecorationName.Left),
  [DecorationName.Right]: createDecoration(DecorationName.Right)
});

const Decorations: Set<React.FunctionComponent> = new Set([
  Field.Top,
  Field.TopLeft,
  Field.TopRight,
  Field.Bottom,
  Field.BottomLeft,
  Field.BottomRight,
  Field.Left,
  Field.Right
]);