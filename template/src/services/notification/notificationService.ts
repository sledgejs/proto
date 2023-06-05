import { makeObservable, observable } from 'mobx';
import { Kernel } from '../../kernel/kernel';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';
import { Notification } from './notification';
import { NotificationType } from './notificationSchema';

const TIMEOUTS: { [key in NotificationType]: number } = {
  'Default': 5000,
  'Info': 5000,
  'Loading': 0,
  'Success': 3000,
  'Warning': 3000,
  'Error': 7000
}

/** 
 * Manages UI notifications in the application.
 */
export class NotificationService
  extends ServiceBase {

  /**
   * Creates a new instance of {@link NotificationService}.
   */
  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);
  }

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.Notification;

  /**
   * The list of active notifications that should be displayed in the UI.
   */
  readonly notifications = observable.array<Notification>()

  /**
   * Gets a notification by ID.
   * @param id The ID of the notification to return.
   */
  getNotificationById(id: string): Notification | null {
    return this.notifications.find(item => item.id === id) ?? null;
  }

  /**
   * Creates a new notification using the provided arguments and shows it in the UI.
   * 
   * @param content The content to display in the notification box.
   * @param title   The title of the notification box.
   * @param type    The type of the notification to display.
   * @param replace If true, replace any other notifications in the notification area.
   */
  notify(
    content: string,
    title?: string,
    type: NotificationType = NotificationType.Default,
    replace: boolean = false): void {

    let timeout = TIMEOUTS[type || 'Default'];

    let notification = new Notification(this.kernel, {
      duration: timeout,
      title: title,
      content: content,
      type
    });

    if (replace) {
      this.notifications.replace([notification]);
    } else
      this.notifications.push(notification);
  }

  /**
   * Shortcut for calling {@link NotificationService.notify} with the 
   * `type` set to {@link NotificationType.Error}.
   * 
   * @see {@link NotificationService.notify} for more details.
   */
  notifyError(
    content: string,
    title = 'Error',
    replace?: boolean): void {

    this.notify(content, title, NotificationType.Error, replace);
  }

  /**
   * Shortcut for calling {@link NotificationService.notify} with the 
   * `type` set to {@link NotificationType.Success}.
   * 
   * @see {@link NotificationService.notify} for more details.
   */
  notifySuccess(
    content: string,
    title = 'Success',
    replace?: boolean) {

    this.notify(content, title, NotificationType.Success, replace);
  }

  /**
   * Shortcut for calling {@link NotificationService.notify} with the 
   * `type` set to {@link NotificationType.Warning}.
   * 
   * @see {@link NotificationService.notify} for more details.
   */
  notifyWarning(
    content: string,
    title = 'Warning',
    replace?: boolean) {

    this.notify(content, title, NotificationType.Warning, replace);
  }

  /**
   * Shortcut for calling {@link NotificationService.notify} with the 
   * `type` set to {@link NotificationType.Info}.
   * 
   * @see {@link NotificationService.notify} for more details.
   */
  notifyInfo(
    content: string,
    title: string = 'Info',
    replace?: boolean) {

    this.notify(content, title, NotificationType.Info, replace);
  }
}