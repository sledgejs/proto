import { ReactElement } from 'react';
import { Location } from 'react-router-dom';
import { AuthFlowName } from '../services/auth/authSchema';

export enum RouteType {
  Auth = 'Auth',
  Direct = 'Direct',
  Private = 'Private',
  Public = 'Public'
}

export type RouteDescriptor<TData = any> = {
  path: string;
  routeType: RouteType;
  element: ReactElement;
  data?: TData | null;
}

export enum RouteAction {
  Push = 'Push',
  Pop = 'Pop',
  Replace = 'Replace'
}

export type RouteContext = {
  location: Location;
  descriptor: RouteDescriptor;
}

export type RouteVisit = {
  action: RouteAction;
  context: RouteContext;
  index: number;
  historyIndex: number;
}

export interface IRouteStorage {
  lastPrivatePath: string | null;
}