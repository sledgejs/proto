import { ReactElement } from 'react';
import { Location } from 'react-router-dom';

/**
 * The type of route as it relates to the
 * access privileges and authentication requirements.
 */
export enum RouteType {
  /**
   * Indicates that the route is one used by the user to authenticate themselves,
   * like a login or a register page. 
   * These pages will be bypassed if the user is already authorized.
   */
  Auth = 'Auth',

  /**
   * Indicates that the route should be displayed as is, without any authorization.
   */
  Direct = 'Direct',

  /**
   * Indicates that the route is only accessible to authenticated users.
   * If the user is not authenticated then they will be redirected to the appropriate
   * authentication page.
   */
  Private = 'Private',
  
  /**
   * Indicates that the route is only accessible to both authenticated and anonymous users.
   * An authorization must still happen, but it will always fallback to anonymous mode
   * if the user is not authenticated.
   */
  Public = 'Public'
}

/**
 * Object used in error lookups to map a set of properties to a specific route.
 */
export type RouteDescriptor<TData = any> = {
  /**
   * The path which the router should match.
   */
  path: string;
  
  /**
   * The type of the route.
   */
  routeType: RouteType;

  /**
   * The React element to render when the router matches this route.
   */
  element: ReactElement;

  /**
   * Additional data to include for the route.
   */
  data?: TData | null;
}

/**
 * The router action which triggered a particular routing history change.
 */
export enum RouteAction {
  Push = 'Push',
  Pop = 'Pop',
  Replace = 'Replace'
}

/**
 * The current state of the router, including the location and details
 * about the route it matched.
 */
export type RouteContext = {

  /**
   * The router location object, as it was matched.
   */
  location: Location;
  
  /**
   * The route descriptor object, as it was retrieved from the lookup.
   * Will always be the same for the same match, regardless of the
   * variations in the location.
   */
  descriptor: RouteDescriptor;
}

/**
 * Describes a visit in the application.
 * Visits are different from contexts because each time a change to the
 * router history happens, a new visit created, regardless of the type of
 * action which triggered the change.
 */
export type RouteVisit = {
  /** 
   * The router action which triggered the creation of the visit.
   */
  action: RouteAction;

  /**
   * The route context as it was when the visit occurred.
   */ 
  context: RouteContext;
  
  /**
   * The index of the visit in the always-growing visit history.
   */
  index: number;

  /**
   * The index in the native router history.
   * Differs from {@link RouteVisit.index} because the native router
   * history grows and shrinks depending on the route actions.
   */
  historyIndex: number;
}