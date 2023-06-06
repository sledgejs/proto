import { action, makeObservable, observable } from 'mobx';
import type { Maybe } from '../../core/types';
import { Kernel } from '../../kernel/kernel';
import { Node } from '../../kernel/node';
import { useModel } from '../componentHooks';

/**
 * Backing object for form labels in the application.
 */
export class LabelState
  extends Node {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);
  }

  /**
   * The DOM ID of the input with which this label is associated.
   */
  @observable inputId: string | null = null;
  
  /**
   * The DOM ID of this label.
   */
  @observable labelId: string | null = null;

  /**
   * Sets the value of {@link LabelState.inputId}.
   */
  @action
  setInputId(inputId: Maybe<string>) {
    this.inputId = inputId ?? null;
  }

  /**
   * Clears the value of {@link LabelState.inputId}.
   */
  @action
  clearInputId() {
    this.inputId = null;
  }
  
  /**
   * Sets the value of {@link LabelState.labelId}.
   */
  @action
  setLabelId(labelId: Maybe<string>) {
    this.labelId = labelId ?? null;
  }

  /**
   * Clears the value of {@link LabelState.labelId}.
   */
  @action
  clearLabelId() {
    this.labelId = null;
  }
}

export function useLabelState(): LabelState {
  return useModel(kernel => new LabelState(kernel));
}