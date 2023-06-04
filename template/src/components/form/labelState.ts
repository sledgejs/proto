import { action, makeObservable, observable } from 'mobx';
import type { Maybe } from '../../core/types';
import { Kernel } from '../../kernel/kernel';
import { Node } from '../../kernel/node';
import { useModel } from '../componentHooks';

export class LabelState
  extends Node {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);
  }

  @observable inputId: string | null = null;
  @observable labelId: string | null = null;

  @action
  setInputId(inputId: Maybe<string>) {
    this.inputId = inputId ?? null;
  }

  @action
  clearInputId() {
    this.inputId = null;
  }
  
  @action
  setLabelId(labelId: Maybe<string>) {
    this.labelId = labelId ?? null;
  }

  @action
  clearLabelId() {
    this.labelId = null;
  }
}

export function useLabelState(): LabelState {
  return useModel(kernel => new LabelState(kernel));
}