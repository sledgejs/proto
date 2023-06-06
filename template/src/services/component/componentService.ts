import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';

import type { Kernel } from '../../kernel/kernel';
import type{ UseModelFunc } from '../../components/componentHooks';
import type { PageName, PageState } from '../../pages/pageSchema';

/**
 * Service which manages component states for the application.
 */
export class ComponentService
  extends ServiceBase {

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.Component;
  
  private readonly pages = new Map<PageName, any>();

  /**
   * Gets a page state for the specified page name if one 
   * has been previously been defined, or `null` otherwise.
   * 
   * @typeParam T The type of the qualified name of the page based on which the correct type 
   *              of the page state will be returned.
   */
  getPage<T extends PageName>(name: T): PageState[T] | null {
    return (this.pages.get(name) as PageState[T]) ?? null;
  }

  /**
   * Sets a page state for the specified page name.
   * 
   * @typeParam T The type of the qualified name of the page based on which the correct type 
   *              of the input page state will be set.
   */
  setPage<T extends PageName>(name: T, model: PageState[T]): void {
    this.pages.set(name, model);
  }

  /**
   * Deletes the page state for the specified page name.
   * 
   * @typeParam T The type of the qualified name of the page.
   */
  deletePage<T extends PageName>(name: T): void {
    this.pages.delete(name);
  }

  /**
   * Returns a React hook which creates and reuses a page state
   * for the specified page name.
   * 
   * @typeParam T The type of the qualified name of the page based on which the correct type 
   *              of the input page state will be set.
   */
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