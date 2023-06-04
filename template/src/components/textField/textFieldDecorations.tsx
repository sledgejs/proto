import '../input/input.scss';
import './textField.scss';

import { observer } from 'mobx-react-lite';
import { HTMLAttributes } from 'react';
import { useInputContext } from '../form/inputContext';
import { TextField } from './textField';

type Props = HTMLAttributes<{}>;

export const DefaultTextFieldEndDecoration = observer((props: Props) => {

  const model = useInputContext();
  if (!model)
    return null;

  return (
    <TextField.End>
    </TextField.End>
  );
});