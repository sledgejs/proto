import { LogLevel } from '../diagnostics/logSchema';
import { DevState } from './devState';

export type DevOptions = {
  /** 
   * If true then the object will be treated as if there should only be a single instance of it in the app.
   * The log label won't include the instance ID and by default `warnOnMultipleInstances` will become true.
   * @default false
   */
  singleton?: boolean | null;

  typeName?: string | null;
  instanceName?: string | null;
  id?: boolean | string | null;
  color?: string | null;
  warnOnMultipleInstances?: boolean | null;

  logLevel?: LogLevel | LogLevel[] | null;
}

export interface DevAnnotatedObject {
  _dev?: DevState;
}

export const DefaultDevOptions: DevOptions = {
  singleton: false,
  warnOnMultipleInstances: false
}

export enum DevMode {
  App = 'App',
  Storybook = 'Storybook',
  Test = 'Test'
}