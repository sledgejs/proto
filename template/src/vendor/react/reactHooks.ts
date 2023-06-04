import { MutableRefObject, useRef } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { Func } from '../../core/types';

export type InitialRefValue<T, TArgs extends any[] = any[]> = T | Func<T, TArgs>;

/**
 * Provide either an initial value or a function which generates the initial value at first render.
 */
export function useInitialRef<T, TArgs extends any[] = any[]>(val: InitialRefValue<T, TArgs>, ...args: TArgs): MutableRefObject<T> {

  let initVal: T | null = null;
  if (typeof val !== 'function')
    initVal = val;

  const ref = useRef(initVal);

  if (typeof val === 'function' && !ref.current) {
    // TODO: fix typings
    const initRetVal = (val as Function)(...args); 
    ref.current = initRetVal;
  }

  // we can safely cast since there will always be a value
  return ref as MutableRefObject<T>;
}

export { useDeepCompareEffect };