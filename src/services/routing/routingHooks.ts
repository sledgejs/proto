import { useKernel } from '../../kernel/kernelHooks';

export function useRoutingService() {
  const kernel = useKernel();
  return kernel.routingService;
}