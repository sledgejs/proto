import { useContext, useEffect, useRef } from 'react';
import { Kernel } from './kernel';
import { KernelContext } from './kernelContext';

export function useKernel(): Kernel {
  return useContext(KernelContext);
}

export function useRootKernel(): Kernel {

  const ref = useRef<Kernel | null>(null);

  useEffect(() => {
    return () => {
      const kernel = ref.current;
      if (kernel)
        kernel.dispose();
    }
  }, []);

  if (!ref.current)
    ref.current = new Kernel();

  const kernel = ref.current;
  return kernel;
}