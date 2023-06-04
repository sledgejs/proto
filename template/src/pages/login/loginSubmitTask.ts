import { action, computed, makeObservable } from 'mobx';
import type { AsyncResult } from '../../core/types';
import { Kernel } from '../../kernel/kernel';
import { type AuthFlowResponse } from '../../services/auth/authSchema';
import type { LoginInput } from '../../services/auth/authInputSchema';
import { LoginFlow } from '../../services/auth/flows/loginFlow';
import { ITaskLike } from '../../tasks/taskSchema';
import { BaseTask, BaseTaskProps } from '../../tasks/baseTask';

type Props = BaseTaskProps & {
  input: LoginInput;
}

export class LoginSubmitTask
  extends BaseTask<AuthFlowResponse>
  implements ITaskLike<AuthFlowResponse> {

  constructor(kernel: Kernel, props: Props) {
    super(kernel, props);
    makeObservable(this);

    this.input = props.input;
    this.flow = new LoginFlow(this.kernel, {
      abortSignal: this.abortSignal
    });
  }

  readonly input: LoginInput;
  readonly flow: LoginFlow;

  @computed get response(): AuthFlowResponse | null {
    return this.flow.response;
  }
  
  @action
  protected async executor(): AsyncResult<AuthFlowResponse> {

    const { input } = this;
    const { flow } = this;
    const [res, err] = await flow.run(input);
    if (err)
      return [null, err];

    return [res];
  }
}