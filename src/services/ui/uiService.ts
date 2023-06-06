import { action, makeObservable, observable } from 'mobx';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';
import type { Kernel } from '../../kernel/kernel';
import { DragEvent, PointerEvent } from 'react';

/**
 * Service which manages all UI related global tasks which
 * are not handled by other services.
 * Responsibilities of this service include global keyboard and pointer events,
 * fullscreen management, clipboard management, etc.
 */
export class UiService
  extends ServiceBase {

  /**
   * Creates a new instance of {@link UiService}.
   */
  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);

    this.init();
  }

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.UI;

  private readonly pointerDownLookup = observable.map<number, PointerEvent>();

  /**
   * The current x-coordinate of the pointer while dragging.
   */
  @observable cursorDragX: number = 0;
  
  /**
   * The current y-coordinate of the pointer while dragging.
   */
  @observable cursorDragY: number = 0;

  /**
   * The current drag target of the pointer while dragging.
   */
  @observable dragTarget: any = null;
  
  /**
   * Gets the current drag status of the UI.
   */
  @observable isDragging = false;

  protected init() {

    // Firefox does not set the position at drag event so we need 
    // this workaround to have the drag position for custom drag shadow
    window.addEventListener('dragstart', 
      this.updateCursorDragCoordinates);

    window.addEventListener('dragover', 
      this.updateCursorDragCoordinates);
  }

  dispose() {

    window.removeEventListener('dragstart', 
      this.updateCursorDragCoordinates);

    window.removeEventListener('dragover', 
      this.updateCursorDragCoordinates);
  }

  /**
   * Handler for the root `pointerdown` event.
   */
  @action
  handleRootPointerDown = (evt: PointerEvent) => {
    this.pointerDownLookup.set(evt.pointerId, evt);
  }

  /**
   * Handler for the root `pointerup` event.
   */
  @action
  handleRootPointerUp = (evt: PointerEvent) => {
    this.pointerDownLookup.delete(evt.pointerId);
  }

  /**
   * Handler for the root `pointercancel` event.
   */
  @action
  handleRootPointerCancel = (evt: PointerEvent) => {
    this.pointerDownLookup.delete(evt.pointerId);
  }

  /**
   * Handler for the root `dragstart` event.
   */
  @action
  handleRootDragStart = (evt: DragEvent) => {
    this.isDragging = true;
  }

  /**
   * Handler for the root `dragend` event.
   */
  @action
  handleRootDragEnd = (evt: DragEvent) => {
    this.isDragging = false;
    this.dragTarget = null;
  }

  /**
   * Handler for the root `drop` event.
   */
  @action
  handleRootDrop = (evt: DragEvent) => {
    this.isDragging = false;
    this.dragTarget = null;
  }
  
  @action
  private updateCursorDragCoordinates = (evt: MouseEvent) => {
    this.cursorDragX = evt.pageX;
    this.cursorDragY = evt.pageY;
  }
}