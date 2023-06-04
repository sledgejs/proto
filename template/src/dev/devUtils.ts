import { indexOf } from 'lodash';
import last from 'lodash/last';

type DevGetCalleeNameOptions = {
  includeInstance?: boolean | null;
  addCallParens?: boolean | null;
  stackPositionOffset?: number | null;
}

const DevGetCalleeNameDefaultOptions: DevGetCalleeNameOptions = {
  addCallParens: true,
  includeInstance: false
}


/**
 * Hacky, debug only function to get the name of the currently executing function.
 * The result depends on where you place the call in the expected call stack.
 * Use the `level` param to adjust for that.
 */
export function devGetCalleeName(devFuncName: string, opts: DevGetCalleeNameOptions = DevGetCalleeNameDefaultOptions): string | null {
  // inspired from https://stackoverflow.com/a/39337724/478593

  opts = {
    ...DevGetCalleeNameDefaultOptions,
    ...opts
  }

  const fakeErrMsg = 'DevGetCalleeNameFakeError';
  const err = new Error(fakeErrMsg);
  const stack = err.stack;

  if (!stack)
    return null;

  const lines = stack.split('\n');

  const callLine = (() => {

    // account for mobx action wrapping
    const firstDevFuncNameLine = lines.find(line => line.includes(devFuncName));
    const firstDevFuncNameLineIndex = lines.indexOf(firstDevFuncNameLine!);

    if (firstDevFuncNameLineIndex >= 0)
      return lines[firstDevFuncNameLineIndex + 1];
      
    const callLines = lines.filter(line =>
      !line.includes(fakeErrMsg) &&
      !line.includes('src/dev') &&
      !line.includes('node_modules'));

    const callLine = callLines[0];
    
    // try to detect react renders
    if (
      callLine &&
      callLine.includes('eval') &&
      callLine.includes('src') &&
      callLine.includes('.tsx'))
      return 'render';

    return callLine;
  })();

  if (!callLine)
    return null;

  // " at functionName ( ..." => "functionName"
  let callee = callLine.replace(/^\s+at\s+(.+?)\s.+/g, '$1');

  if (opts.addCallParens)
    callee += '()';

  if (!opts.includeInstance)
    callee = last(callee.split('.'))!;

  return callee;
}