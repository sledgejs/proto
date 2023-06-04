export enum NotificationType {
  Default = 'Default',
  Error = 'Error',
  Warning = 'Warning',
  Success = 'Success',
  Info = 'Info',
  Loading = 'Loading'
}

export interface INotification {
  id: string;
  duration: number;
  title: string;
  content: string;
  type: NotificationType;
}