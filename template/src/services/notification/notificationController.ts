import { action, makeObservable, observable } from 'mobx';
import { nanoid } from 'nanoid';
import { Kernel } from '../../kernel/kernel';
import { Node } from '../../kernel/node';
import { INotification, NotificationType } from './notificationSchema';

type Props = Partial<INotification> & {
  destroy: ((id: string) => void) | null
};

export class NotificationController
  extends Node {

  constructor(kernel: Kernel, props: Props) {
    super(kernel);
    makeObservable(this);

    this.id = props.id ?? nanoid();;
    this.duration = props.duration ?? null;
    this.title = props.title ?? null;
    this.content = props.content ?? null;
    this.type = props.type ?? null;
    this.destroy = props.destroy ?? null;

    this.open();
  }

  readonly id!: string;
  readonly duration: number | null;
  readonly title: string | null;
  readonly content: string | null;
  readonly type: NotificationType | null;
  readonly destroy: ((id: string) => void) | null;

  // below properties are not used to control the notification toasts, but it could come in handy if too many issues occur with the uncontrolled version
  // private hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
  @observable isVisible: boolean = false;

  @action
  open() {
    this.isVisible = true;
    // if (this.duration) 
    //   this.hideTimeoutId = setTimeout(() => this.close(true), this.duration);
  }

  @action
  close(destroy = true) {
    this.isVisible = false;
    // if (typeof this.hideTimeoutId === 'number')
    //   clearTimeout(this.hideTimeoutId);

    if (destroy && this.destroy)
      setTimeout(() => this.destroy?.(this.id), 500);
  }

}