import type { ApiService } from '../services/api/apiService'
import type { AuthService } from '../services/auth/authService';
import type { ComponentService } from './component/componentService';
import type { DiagnosticsService } from './diagnostics/diagnosticsService';
import type { ErrorService } from './error/errorService';
import type { EventService } from './event/eventService';
import type { NetworkService } from './network/networkService';
import type { NotificationService } from './notification/notificationService';
import type { ResourceService } from './resource/resourceService';
import type { RoutingService } from '../services/routing/routingService';
import type { TaskService } from './task/taskService';
import type { UiService } from './ui/uiService';
import type { VendorService } from './vendor/vendorService';

export enum ServiceName {
  Api = 'Api',
  Auth = 'Auth',
  Component = 'Component',
  Diagnostics = 'Diagnostics',
  Error = 'Error',
  Event = 'Event',
  Network = 'Network',
  Notification = 'Notification',
  Resource = 'Resource',
  Routing = 'Routing',
  Task = 'Task',
  UI = 'UI',
  Vendor = 'Vendor'
}

export interface IService {
  readonly serviceName: ServiceName;
}

export type Service = {
  [ServiceName.Api]: ApiService;
  [ServiceName.Auth]: AuthService;
  [ServiceName.Component]: ComponentService;
  [ServiceName.Diagnostics]: DiagnosticsService;
  [ServiceName.Error]: ErrorService;
  [ServiceName.Event]: EventService;
  [ServiceName.Network]: NetworkService;
  [ServiceName.Notification]: NotificationService;
  [ServiceName.Resource]: ResourceService;
  [ServiceName.Routing]: RoutingService;
  [ServiceName.Task]: TaskService;
  [ServiceName.UI]: UiService;
  [ServiceName.Vendor]: VendorService;
}