import { action, makeObservable, observable } from 'mobx';
import { Kernel } from '../../kernel/kernel';
import { Node } from '../../kernel/node';
import { InputState } from './inputState';
import { useModel } from '../componentHooks';

import { error, initDev } from '../../dev';
import { trace } from '../../dev';

/**
 * Backing object for form fields in the application.
 */
export class FieldState
  extends Node {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'blue', logLevel: null });
    trace(this);
  }

  /**
   * The child input which is contained by this field.
   */
  @observable input: InputState | null = null;

  /**
   * Attaches a child input to this instance.
   * If there is alreadty a child input attached, it will be overwritten.
   */
  @action
  attachInput(input: InputState) {
    if (this.input && this.input !== input)
      error(this, `You can only attach a single Input to a Field.`);

    this.input = input;
  }

  /**
   * Detaches the child input from this instance.
   */
  @action
  detachInput() {
    this.input = null;
  }
}

export function useFieldState(): FieldState {
  return useModel(kernel => new FieldState(kernel));
}