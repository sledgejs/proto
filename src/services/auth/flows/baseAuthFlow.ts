import { computed, makeObservable } from 'mobx';
import { Node } from '../../../kernel/node';
import { Kernel } from '../../../kernel/kernel';
import { AuthFlowName, IAuthFlow, type AuthFlowResponse } from '../authSchema';
import { AuthOrchestrator } from '../authOrchestrator';
import type { AsyncResult, AbortableProps } from '../../../core/types';
import { initDev, trace } from '../../../dev';

type Props = AbortableProps;

export type BaseAuthFlowProps = Props;

/**
 * Base class for all auth flow implementations.
 * Abstracts away the abort logic, the creation of the orchestrator
 * and exposes some shortcut getters.
 */
export abstract class BaseAuthFlow
  extends Node
  implements IAuthFlow {

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

  /**
   * The backing auth orchestrator for this flow.
   */
  readonly orchestrator: AuthOrchestrator;

  /**
   * Returns the flow response from the orchestrator, once the flow completes.
   */
  @computed
  get response() {
    return this.orchestrator.response;
  }

  abstract run(...args: any[]): AsyncResult<AuthFlowResponse>;
}