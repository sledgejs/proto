import { useEffect, useId, useRef } from 'react';
import { ObservableRef } from '../core/observableRef';
import { Func, Maybe } from '../core/types';
import { Kernel } from '../kernel/kernel';
import { useKernel } from '../kernel/kernelHooks';

export type UseModelFunc<T> = Func<T, [Kernel]>;

export type ModelOptions<T> = {
  ref?: ObservableRef<T | null> | null;
  model?: T | null;
}

export type ModelWithBindings = {
  attached?(...args: any[]): void | Promise<void>;
  detached?(): void;
}

export function useModel<T>(val: UseModelFunc<T>, options: ModelOptions<T> = {}): T {

  const kernel = useKernel();
  const ref = useRef<T | null>(null);
  if (!ref.current)
    ref.current = val(kernel);

  const modelRef = options.ref;
  const model = ref.current;

  useEffect(() => {
    if (!modelRef)
      return;
    modelRef.current = model;
  }, [model, modelRef]);

  // TODO: check and maybe extend
  const extModel = options.model;
  if (extModel)
    return extModel;

  return model;
}

export function useModelBindings<T extends ModelWithBindings = ModelWithBindings>(model: T) {
  useEffect(() => {
    model.attached?.();
    return () =>
      model.detached?.();
  }, [model]);
}

export function useIdOrDefault(id?: Maybe<string>) {

  const defaultId = useId();
  return id ?? defaultId;
}