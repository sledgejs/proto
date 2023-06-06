import { AsyncResult } from '../../core/types';
import { initDev, trace } from '../../dev';
import { Error } from '../../errors/error';
import { Kernel } from '../../kernel/kernel';

import { ServiceBase } from '../serviceBase';
import { ServiceName } from '../serviceSchema';
import { DefaultLoadResourceOptions, LoadResourceInjectPoint, LoadResourceOptions } from './resourceSchema';

/** 
 * Manages dynamic loading of scripts, stylesheets and other types of resources. 
 */
export class ResourceService
  extends ServiceBase {

  /**
   * Creates a new instance of {@link ResourceService}.
   */
  constructor(kernel: Kernel) {
    super(kernel);

    initDev(this, { color: 'green' });
    trace(this);
  }

  /** @inheritDoc ServiceBase.serviceName */
  readonly serviceName = ServiceName.Resource;

  /**
   * Loads and injects a script into the web page.
   */
  async loadScript(url: string, opts: LoadResourceOptions = DefaultLoadResourceOptions): AsyncResult<HTMLScriptElement> {

    const script = document.createElement('script');

    const scriptPromise = new Promise<any>((res, rej) => {
      script.addEventListener('load', () => {
        res(null);
      });

      script.addEventListener('error', (errEvt) => {
        rej(errEvt.error);
      });
    });

    script.type = 'text/javascript';
    script.async = true;
    script.src = url;

    switch (opts?.injectPoint) {

      case LoadResourceInjectPoint.HeadStart:
        document.head.prepend(script);
        break;
      case LoadResourceInjectPoint.HeadEnd:
        document.head.append(script);
        break;

      case LoadResourceInjectPoint.BodyStart:
        document.body.prepend(script);
        break;

      default:
      case LoadResourceInjectPoint.BodyEnd:
        document.body.append(script);
        break;
    }

    try {
      await scriptPromise;
    }
    catch (err) {
      return [null, new Error('Resources.LoadScriptFailed')];
    }

    // TODO: test
    const { callback } = opts;
    if (callback)
      callback();

    return [script];
  }
}