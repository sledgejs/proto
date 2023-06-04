import { action, makeObservable, observable } from 'mobx';
import { Kernel } from '../../kernel/kernel';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';
import { NotificationController } from './notificationController';
import { NotificationType } from './notificationSchema';

const TIMEOUTS: { [key in NotificationType]: number } = {
  'Default': 5000,
  'Info': 5000,
  'Loading': 0,
  'Success': 3000,
  'Warning': 3000,
  'Error': 7000
}

export class NotificationService
  extends ServiceBase {

  constructor(kernel: Kernel) {
    super(kernel);
    makeObservable(this);
  }

  readonly serviceName = ServiceName.Notification;

  @observable notificationList = observable.array<NotificationController>()

  getNotificationById(id: string) {
    return this.notificationList.find(item => item.id === id);
  }

  notify(content: string, title?: string, type: NotificationType = NotificationType.Default, withClear: boolean = false) {

    let timeout = TIMEOUTS[type || 'Default'];

    let notification = new NotificationController(this.kernel, {
      duration: timeout,
      title: title,
      content: content,
      type,
      destroy: this.remove
    });

    if (withClear) {
      this.clear();
      this.notificationList.replace([notification]);
    } else
      this.notificationList.push(notification);
  }

  notifyError(content: string, title: string = 'Error', withClear?: boolean) {
    this.notify(content, title, NotificationType.Error, withClear);
  }

  notifySuccess(content: string, title: string = 'Success', withClear?: boolean) {
    this.notify(content, title, NotificationType.Success, withClear);
  }

  notifyWarning(content: string, title: string = 'Warning', withClear?: boolean) {
    this.notify(content, title, NotificationType.Warning, withClear);
  }

  notifyInfo(content: string, title: string = 'Info', withClear?: boolean) {
    this.notify(content, title, NotificationType.Info, withClear);
  }

  @action
  remove = (id: string) => {
    const notification = this.notificationList.find(item => item.id === id);
    if (notification)
      this.notificationList.remove(notification);
  }

  @action
  clear() {
    this.notificationList.forEach(item => item.close());
    this.notificationList.clear();
  }
}