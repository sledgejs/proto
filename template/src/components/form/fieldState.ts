import { action, makeObservable, observable } from 'mobx';
import { Kernel } from '../../kernel/kernel';
import { error, initDev } from '../../dev';
import { trace } from '../../dev';
import { Node } from '../../kernel/node';
import { InputState } from './inputState';
import { useModel } from '../componentHooks';

export class FieldState
  extends Node {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    initDev(this, { color: 'blue', logLevel: null });
    trace(this);
  }

  @observable input: InputState | null = null;

  @action
  attachInput(input: InputState) {
    if (this.input && this.input !== input)
      error(this, `You can only attach a single Input to a Field.`);

    this.input = input;
  }

  @action
  detachInput() {
    this.input = null;
  }
}

export function useFieldState(): FieldState {
  return useModel(kernel => new FieldState(kernel));
}