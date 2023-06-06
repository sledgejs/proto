import { Maybe, ObjectLiteral } from '../types';

export type PropDictionary = Record<string, any>;

export type PropKey = string;

export type BindingPropValueFunc<T> =
  (fallback?: T) => Maybe<T>;

/**
 * Represents a prop value which can be either a static value or a binding value.
 */
export type BindingPropValue<T> =
  BindingPropValueFunc<T> | Maybe<T>;

export type ResolvedPropValue<T> =
  T extends BindingPropValue<infer TValue> ? TValue : null;

export type ResolvedProps<TProps extends ObjectLiteral> = {
  [key in keyof TProps]: ResolvedPropValue<TProps[key]>
};

/**
 * Represents an object literal of properties which can be either static, binding or any combination of those.
 */
export type BindingProps<TProps> = {
  [key in keyof TProps]?: BindingPropValue<TProps[key]>
}

export type PropChangeListener<T = any> =
  (val: T, prevVal: T) => void;
export type PropDiscardListener<T = any> =
  (val: T, nextVal: T) => void;
