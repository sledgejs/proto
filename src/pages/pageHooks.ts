import { ModelOptions, UseModelFunc } from '../components/componentHooks';
import { useKernel } from '../kernel/kernelHooks';
import { PageName, PageState } from './pageSchema';

export function usePersistentPage<T extends PageName>(name: PageName, val: UseModelFunc<PageState[T]>, options: ModelOptions<T> = {}): PageState[T] {

  const kernel = useKernel();
  const { componentService } = kernel;

  const existingModel = componentService.getPage(name);
  if (existingModel)
    return existingModel;

  const model = val(kernel);
  componentService.setPage(name, model);

  return model;
}