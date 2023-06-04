import { computed, makeObservable } from 'mobx';
import { Node } from '../../../kernel/node';
import { Kernel } from '../../../kernel/kernel';
import { AuthFlowName, type AuthFlowResponse } from '../authSchema';
import { AuthOrchestrator } from '../authOrchestrator';
import type { AsyncResult, AbortableProps } from '../../../core/types';
import { initDev, trace } from '../../../dev';

type Props = AbortableProps;

export type BaseAuthFlowProps = Props;

export abstract class BaseAuthFlow
  extends Node {

  /**
   * Creates a new instance of the `BaseAuthFlow` abstract class.
   * This sets the props provided on the instance and also configures
   * and assigns the AuthOrchestrator to the instance.
   */
  constructor(kernel: Kernel, props: Props = {}) {
    super(kernel);
    makeObservable(this);

    initDev(this);
    trace(this);

    const { abortSignal } = props;

    this.abortSignal = abortSignal ?? null;
    this.orchestrator = new AuthOrchestrator(this.kernel, {
      abortSignal
    });
  }

  abstract get flowName(): AuthFlowName;

  readonly abortSignal: AbortSignal | null = null;
  readonly orchestrator: AuthOrchestrator;

  @computed
  get response() {
    return this.orchestrator.response;
  }

  abstract run(...args: any[]): AsyncResult<AuthFlowResponse>;
}