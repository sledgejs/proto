import { action, makeObservable, observable } from 'mobx';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';
import type { Kernel } from '../../kernel/kernel';
import { DragEvent, PointerEvent } from 'react';

export class UiService
  extends ServiceBase {

  readonly serviceName = ServiceName.UI;
  
  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    // Firefox does not set the position at drag event so we need this workaround to have the drag position for custom drag shadow
    // TODO: encapsulate the logic in a separate entity
    window.addEventListener('dragstart', (evt) => this.updateCursorDragCoordinates(evt));
    window.addEventListener('dragover', (evt) => this.updateCursorDragCoordinates(evt));
  }

  readonly pointerDownLookup = observable.map<number, PointerEvent>();

  @observable cursorDragX: number = 0;
  @observable cursorDragY: number = 0;

  @observable dragTarget: any = null;
  @observable isDragging = false;

  @action
  updateCursorDragCoordinates(evt: MouseEvent) {
    this.cursorDragX = evt.pageX;
    this.cursorDragY = evt.pageY;
  }

  @action
  handleRootPointerDown = (evt: PointerEvent) => {
    this.pointerDownLookup.set(evt.pointerId, evt);
  }

  @action
  handleRootPointerUp = (evt: PointerEvent) => {
    this.pointerDownLookup.delete(evt.pointerId);
  }

  @action
  handleRootPointerCancel = (evt: PointerEvent) => {
    this.pointerDownLookup.delete(evt.pointerId);
  }

  @action
  handleRootDragStart = (evt: DragEvent) => {
    this.isDragging = true;
  }

  @action
  handleRootDragEnd = (evt: DragEvent) => {
    this.isDragging = false;
    this.dragTarget = null;
  }

  @action
  handleRootDrop = (evt: DragEvent) => {
    this.isDragging = false;
    this.dragTarget = null;
  }
}