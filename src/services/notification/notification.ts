import { makeObservable } from 'mobx';
import { nanoid } from 'nanoid';
import { Kernel } from '../../kernel/kernel';
import { Node } from '../../kernel/node';
import { NotificationType } from './notificationSchema';

export type NotificationProps = {
  
  /**
   * @inheritDoc Notification.type
   */
  type?: NotificationType | null;

  /**
   * @inheritDoc Notification.content
   */
  content: string;

  /**
   * @inheritDoc Notification.title
   */
  title?: string | null;

  /**
   * @inheritDoc Notification.duration
   */
  duration?: number | null;
}

type Props = NotificationProps;

/**
 * Data container for a UI notification.
 */
export class Notification
  extends Node {

  /**
   * Creates a new instance of {@link Notification}
   * using the provided arguments.
   */
  constructor(kernel: Kernel, props: Props) {
    super(kernel);
    makeObservable(this);

    this.id = nanoid();
    this.type = props.type ?? null;
    this.content = props.content;
    this.title = props.title ?? null;
    this.duration = props.duration ?? null;
  }

  /**
   * The locally unique identifier of the notification.
   */
  readonly id!: string;
  
  /**
   * The duration after which the notification should disappear.
   */
  readonly duration: number | null;

  /**
   * The title of the notification box.
   */
  readonly title: string | null;
  
  /**
   * The content to display in the notification box.
   */
  readonly content: string | null;

  /**
   * The type of the notification to display.
   */
  readonly type: NotificationType | null;
}