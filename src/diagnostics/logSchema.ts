import { EnvType, RuntimeType } from '../context';

export enum LogLevel {
  Trace = 'Trace',
  Debug = 'Debug',
  Info = 'Info',
  Warn = 'Warn',
  Error = 'Error'
}

export const LogLevelIndexLookup = {
  [LogLevel.Trace]: 1,
  [LogLevel.Debug]: 2,
  [LogLevel.Info]: 3,
  [LogLevel.Warn]: 4,
  [LogLevel.Error]: 5
}

export const LogLevelNameLookup = {
  1: [LogLevel.Trace],
  2: [LogLevel.Debug], 
  3: [LogLevel.Info], 
  4: [LogLevel.Warn],  
  5: [LogLevel.Error] 
}

export type LogFilter = Partial<{
  level: LogLevel | LogLevel[];
  object: string | string[];
  message: string | string[];
  runtimeType: RuntimeType | RuntimeType[];
  envType: EnvType | EnvType[];
}>