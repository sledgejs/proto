import { action, IReactionOptions, observable, reaction } from 'mobx';
import { Maybe } from '../types';
import type { BindingPropValue, PropChangeListener, PropDictionary, PropDiscardListener, ResolvedProps, ResolvedPropValue } from './propSchema';

/** 
 * Manages static and dynamic props which enables the structured dependency sharing between nodes.
 */
export class PropManager<TProps extends PropDictionary = PropDictionary> {

  constructor(props?: TProps) {

    for (const key in props)
      this.set(key, props[key]);

    this.props = new Proxy({} as any, {
      get: (target, propName) => {
        if (typeof propName !== 'string')
          return null;
        return this.get(propName);
      },
      set: (target, propName, value) => {
        if (typeof propName !== 'string')
          return false;
        this.set(propName, value);
        return true;
      }
    });

    this.resolvedProps = new Proxy({} as any, {
      get: (target, propName) => {
        if (typeof propName !== 'string')
          return null;
        return this.getResolved(propName);
      },
      set: (target, propName) => {
        throw new Error(`You cannot change the value of a resolvedProp.`)
      }
    });
  }

  private readonly propLookup = observable.map<keyof TProps, any>({}, { deep: false });

  private readonly props: TProps;
  private readonly resolvedProps: ResolvedProps<TProps>;

  /**
   * Sets properties on this manager.
   */
  @action
  setProps(props: Partial<TProps>) {
    for (const key in props)
      this.set(key, props[key]);
  }

  /**
   * Sets a property on this manager.
   */
  @action
  set<T extends keyof TProps>(name: T, val: BindingPropValue<TProps[T]>) {
    this.propLookup.set(name, val);
    return this;
  }

  /**
   * Gets the value of the target property as it was specified, without any kind of resolving.
   * An optional fallback value can be provided, which will be returned only if the property name cannot be found in the lookup.
   * This means that if you provided your prop as `null`, it will be returned as such, instead of the fallback.
   * This method always returns `null` instead of `undefined`.
   * 
   * @param name      The name of the property for which to get the unresolved value.
   * @param fallback  A value which will be returned if the property name cannot be found in the lookup.
   * 
   * @example // Returning a specified value
   * manager.set('prop', 0)
   * manager.get('prop') // -> 0
   * 
   * @example // Returning a fallback when the value was not specified or deleted
   * manager.delete('prop')
   * manager.get('prop', 'fallback') // -> 'fallback'
   * 
   * @example // Returning a value which was set to undefined, instead of the fallback
   * manager.set('prop', undefined)
   * manager.get('prop', 'fallback') // -> null
   * 
   * @example // Returning the exact function when it is specified as the value
   * manager.set('prop', () => 'fn')
   * manager.get('prop') // -> () => 'fn' 
   */
  get<T extends keyof TProps>(name: T, fallback?: TProps[T]): BindingPropValue<TProps[T]> {
    if (!this.propLookup.has(name)) {
      if (fallback !== undefined)
        return fallback;
      else
        return null;
    }

    const propVal = this.propLookup.get(name);
    if (propVal === undefined)
      return null;
    return propVal;
  }

  /**
   * Gets the value of the target property, attempting to resolve it.
   * This means that if the property is a function, it will be invoked and the result returned as the value.
   * An optional fallback value can be provided, which will be returned only if the property name cannot be found in the lookup.
   * This method always returns `null` instead of `undefined`.
   * 
   * @param name      The name of the property for which to get the resolved value.
   * @param fallback  A value which will be returned if the property name cannot be found in the lookup.
   */
  getResolved<T extends keyof TProps>(name: T, fallback?: TProps[T]): ResolvedPropValue<TProps[T]> | null {
    if (!this.propLookup.has(name)) {
      if (fallback !== undefined)
        return fallback;
      else
        return null;
    }

    const propVal = this.propLookup.get(name);
    return this.resolve(propVal, fallback);
  }

  /**
   * Deletes a property from this manager.
   */
  delete<T extends keyof TProps>(name: T) {
    this.propLookup.delete(name);
    return this;
  }

  /**
   * Adds a listener for a specific property which will be invoked
   * when a new property value is set.
   */
  onChange<T extends keyof TProps>(propName: T, listener: PropChangeListener<ResolvedPropValue<TProps[T]>>) {
    const reactionOpts: IReactionOptions<ResolvedPropValue<TProps[T]> | null, boolean> = {
      fireImmediately: true
    }

    reaction(() => this.getResolved(propName),
      (value, prevValue) =>
        listener(value!, prevValue!),
      reactionOpts);

    return this;
  }

  /**
   * Adds a listener for a specific property which will be invoked
   * before an old property value will be replaced.
   */
  onDiscard<T extends keyof TProps>(propName: T, listener: PropDiscardListener<ResolvedPropValue<TProps[T]>>) {

    const reactionOpts: IReactionOptions<ResolvedPropValue<TProps[T]> | null, boolean> = {
      fireImmediately: false
    }

    reaction(() => this.getResolved(propName),
      (value, prevValue) =>
        listener(prevValue!, value!),
      reactionOpts);

    return this;
  }

  private resolve<T extends keyof TProps>(
    arg: BindingPropValue<TProps[T]> | undefined,
    fallback: Maybe<TProps[T]>): TProps[T] | null {

    if (typeof arg === 'function')
      return (arg as Function)(fallback);
    if (arg !== undefined)
      return arg;

    return null;
  }
}