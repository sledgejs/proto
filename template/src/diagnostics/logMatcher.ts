import { Minimatch } from 'minimatch';
import { Config } from '../config/config';
import { isNonEmptyString } from '../core/typeUtils';
import { Log } from './log';
import { LogFilter, LogLevel, LogLevelIndexLookup } from './logSchema';
import { Maybe } from '../core/types';
import { Context } from '../context';

export function logFieldMatchesFilterValue(value: string, filter: Maybe<string | string[]>) {
  
  if (!filter)
    return true;

  if (!Array.isArray(filter))
    filter = [filter];

  for (const pattern of filter) {
    const matcher = new Minimatch(pattern);
    if (matcher.match(value))
      return true;
  }

  return false;
}

export function logMatchesFilter(log: Log, filter: LogFilter) {

  const defFilter: LogFilter = {
    level: [LogLevel.Trace, LogLevel.Debug]
  }

  filter = {
    ...defFilter,
    ...filter
  };

  if (!logFieldMatchesFilterValue(Context.runtimeType, filter.runtimeType))
    return false;

  if (!logFieldMatchesFilterValue(Context.envType, filter.envType))
    return false;
    
  const obj = log.object._dev;
  const objTokens: string[] = [
    obj?.instanceName!,
    obj?.instanceLabel!,
    obj?.instanceIndex?.toString()!,
    obj?.typeName!,
    obj?.typeLabel!
  ].filter(tok => isNonEmptyString(tok));

  let objFilters = filter.object ?? [];
  let matchesObj = false;

  if (!Array.isArray(objFilters))
    objFilters = [objFilters];

  for (const objFilter of objFilters) {
    const objMatcher = new Minimatch(objFilter);
    if (objTokens.some(tok => objMatcher.match(tok), true)) {
      matchesObj = true;
      break;
    }
  }

  if (!matchesObj)
    return false;

  let msgTokens = log.params?.filter(param => isNonEmptyString(param));
  let msgFilters = filter.message ?? [];
  let matchesMsg = false;

  if (!Array.isArray(msgFilters))
    msgFilters = [msgFilters];

  for (const msgFilter of msgFilters) {
    const msgMatcher = new Minimatch(msgFilter);
    if (msgTokens.some(tok => msgMatcher.match(tok))) {
      matchesObj = true;
      break;
    }
  }

  if (!matchesMsg)
    return false;

  return true;
}

export function logMatches(log: Log) {
  const exclude = Config.diagnostics.excludeLogs;
  const excludeMatches = exclude.some(filter => logMatchesFilter(log, filter));

  const include = Config.diagnostics.includeLogs;
  const includeMatches = include.some(filter => logMatchesFilter(log, filter));

  if (exclude.length > 0 && excludeMatches)
    return false;

  if (include.length > 0 && !includeMatches)
    return false;

  return true;
}

export function aboveLogLevel(level: LogLevel): LogLevel[] {
  const index = LogLevelIndexLookup[level];
  // TODO: implement
  return [];
}

export function belowLogLevel(level: LogLevel): LogLevel[] {
  const index = LogLevelIndexLookup[level];
  // TODO: implement
  return [];
}
