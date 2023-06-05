import { AsyncResult } from '../../core/types'

/**
 * Describes the place at which to inject a script once it's loaded.
 */
export enum LoadResourceInjectPoint {
  /**
   * Instructs the loader to inject the resource before any other 
   * scripts and stylesheets within the <head> tag.
   */
  HeadStart,
  
  /**
   * Instructs the loader to inject the resource after all the other 
   * scripts and stylesheets within the <head> tag.
   */
  HeadEnd,
  
  /**
   * Instructs the loader to inject the resource before any other 
   * scripts and stylesheets within the <body> tag.
   */
  BodyStart,
  
  /**
   * Instructs the loader to inject the resource after all the other 
   * scripts and stylesheets within the <body> tag.
   */
  BodyEnd
}

/**
 * Options to be used for {@link ResourceService.loadScript} and 
 * in the future for stylesheet loaders as well.
 */
export type LoadResourceOptions<T = any> = {

  /**
   * The place at which to inject the resource once it's loaded.
   */
  injectPoint?: LoadResourceInjectPoint;

  /**
   * The callback to execute once the resource is injected.
   */
  callback?: () => AsyncResult<T>;
}

export const DefaultLoadResourceOptions: LoadResourceOptions = {
  injectPoint: LoadResourceInjectPoint.BodyEnd
}