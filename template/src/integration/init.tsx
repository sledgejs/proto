import { createRoot } from 'react-dom/client';

import { initVendors } from './vendors';
import { Kernel } from '../kernel/kernel';
import { Config } from '../config/config';
import { App } from '../pages/app';

import { DevRuntime } from '../dev/devRuntime';
import { trace } from '../dev';

export function init() {

  trace(DevRuntime, `Initialize`);

  trace(DevRuntime, `Current config: `, Config);
  trace(DevRuntime, `Current env: `, import.meta.env);

  initVendors();

  trace(DevRuntime, `Initialize Kernel`);

  const kernel = new Kernel();
  const strictMode = Config.react.strictMode;

  trace(DevRuntime, `Render application`, { strictMode });

  const rootElem = document.getElementById('root') as HTMLElement;
  const root = createRoot(rootElem);

  root.render(
    <App
      strictMode={Config.react.strictMode}
      kernel={kernel} />
  );
}