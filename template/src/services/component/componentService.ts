import { UseModelFunc } from '../../components/componentHooks';
import { Kernel } from '../../kernel/kernel';
import { PageName, PageState } from '../../pages/pageSchema';
import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

export class ComponentService
  extends ServiceBase {

  readonly serviceName = ServiceName.Component;
  
  private readonly pages = new Map<PageName, any>();

  getPage<T extends PageName>(name: PageName): PageState[T] | null {
    return (this.pages.get(name) as PageState[T]) ?? null;
  }

  setPage<T extends PageName>(name: PageName, model: PageState[T]): void {
    this.pages.set(name, model);
  }

  deletePage<T extends PageName>(name: T): void {
    this.pages.delete(name);
  }

  usePage<T extends PageName>(name: T, initFunc: UseModelFunc<PageState[T]>) {
    
    const func = (kernel: Kernel) => {

      const existingModel = this.getPage(name);
      if (existingModel)
        return existingModel;

      const model = initFunc(kernel);
      this.setPage(name, model);

      return model;
    }

    return func;
  }
}