import { DevAnnotatedObject, DevOptions } from './devSchema';
import { GlobalDevConsole } from './devConsole';
import { DevState } from './devState';
import { devGetCalleeName } from './devUtils';

export const initDev = <T extends DevAnnotatedObject>(obj: T, opts?: DevOptions): void => {
  if (import.meta.env.PROD)
    return;

  const annotObj = obj as DevAnnotatedObject;
  const devState = new DevState(obj, opts);

  annotObj._dev = devState;

  GlobalDevConsole.register(obj);
}
export const _initDev = initDev;

export const trace = (obj: DevAnnotatedObject | null, ...params: any[]): void => {
  if (import.meta.env.PROD)
    return;

  obj?._dev?.trace(devGetCalleeName('trace'), ...params);
}
export const _trace = trace;


export const debug = (obj: DevAnnotatedObject | null, ...params: any[]): void => {
  if (import.meta.env.PROD)
    return;

  obj?._dev?.debug(devGetCalleeName('debug'), ...params);
}
export const _debug = debug;


export const info = (obj: DevAnnotatedObject | null, ...params: any[]): void => {
  if (import.meta.env.PROD)
    return;

  obj?._dev?.info(devGetCalleeName('info'), ...params);
}
export const _info = info;


export const warn = (obj: DevAnnotatedObject | null, ...params: any[]): void => {
  if (import.meta.env.PROD)
    return;

  obj?._dev?.warn(devGetCalleeName('warn'), ...params);
}
export const _warn = warn;


export const error = (obj: DevAnnotatedObject | null, ...params: any[]): void => {
  if (import.meta.env.PROD)
    return;

  obj?._dev?.error(devGetCalleeName('error'), ...params);
}
export const _error = error;


export const logError = (obj: DevAnnotatedObject | null, ...params: any[]): void => {
  if (import.meta.env.PROD)
    return;

  obj?._dev?.error(devGetCalleeName('logError') + '()', ...params);
}

export const logSeparator = () => {

}