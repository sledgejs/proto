import { initDev } from './index';
import { DevAnnotatedObject, DevMode } from './devSchema';

export interface DevRuntimeContext
  extends DevAnnotatedObject { }

export class DevRuntimeContext
  implements DevAnnotatedObject {

  constructor() {
    initDev(this, {});
  }

  get mode(): DevMode {
    if (import.meta.env.MODE === 'test')
      return DevMode.Test;
      
    if (import.meta.env.STORYBOOK === 'true')
      return DevMode.Storybook;

    return DevMode.App;
  }
}

export const DevRuntime = new DevRuntimeContext();