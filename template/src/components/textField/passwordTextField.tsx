import { observer } from 'mobx-react-lite';
import { TextField, TextFieldProps } from './textField';
import { PasswordToggleButton } from './passwordToggleButton';
import { action, makeObservable, observable } from 'mobx';
import { useModel } from '../componentHooks';
import type { ChangeEventHandler } from '../form/inputSchema';

type Props = TextFieldProps;

class State {
  constructor() {
    makeObservable(this);
  }

  @observable isChecked = false;

  @action
  handleToggleButtonChange: ChangeEventHandler = (evt, input) => {
    this.isChecked = input.isChecked;
  }
}

export const PasswordTextField = observer(({
  ...props
}: Props) => {

  const model = useModel(() => new State());
  const toggleBtn = <PasswordToggleButton onChange={model.handleToggleButtonChange} />;

  return (
    <TextField type={model.isChecked ? 'text' : 'password'} endDecoration={toggleBtn} {...props} />
  );
});