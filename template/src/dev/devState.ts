import endsWith from 'lodash/endsWith';
import { nanoid } from 'nanoid';
import { GlobalDevConsole } from './devConsole';
import { DevAnnotatedObject, DevOptions } from './devSchema';
import { Log } from '../diagnostics/log';
import { logMatches } from '../diagnostics/logMatcher';
import { LogLevel } from '../diagnostics/logSchema';

export class DevState<T extends DevAnnotatedObject = DevAnnotatedObject> {

  constructor(obj: T, opts?: DevOptions) {

    const dbg = GlobalDevConsole;
    const instIndexCursorLookup = dbg.instanceIndexCursorLookup;

    let typeName = opts?.typeName ?? null;
    let instName = opts?.instanceName ?? null;
    let instIndex: number | null = null;

    if (!typeName) {
      // try to get the name from the constructor
      // will only be useful on unminified code, obviously
      try {
        if (typeof obj === 'function')
          typeName = (obj as Function).name;
        else
          typeName = Object.getPrototypeOf(obj).constructor.name;
      } catch (err) { }
    }

    if (typeName) {

      instIndex = instIndexCursorLookup.get(typeName) ?? null;
      if (typeof instIndex !== 'number')
        instIndex = 1;

      instIndexCursorLookup.set(typeName, instIndex + 1);
    }

    this.options = opts ?? {};
    this.object = obj;
    this.createdAt = new Date();
    this.globalIndex = dbg.globalIndexCursor++;
    this.id = nanoid(6);
    this.typeName = typeName ?? null;
    this.instanceName = instName ?? null;
    this.instanceIndex = instIndex;
    this.color = null;
    this.logs = [];
    this.warnOnMultipleInstances = false;

    if (typeName) {
      let typeLabel = typeName;
      if (endsWith(typeLabel.toLocaleLowerCase(), 'state'))
        typeLabel = typeLabel.slice(0, typeLabel.length - 'state'.length);

      this.typeLabel = typeLabel;
    } else {
      this.typeLabel = 'Unknown';
    }

    if (opts?.singleton !== true && this.typeLabel) {
      if (instName)
        this.instanceLabel = '@' + instName;
      else
        this.instanceLabel = `:${this.instanceIndex}`; // /${this.globalIndex}
    }

    this.label = this.typeLabel + this.instanceLabel;
  }

  readonly options: DevOptions;
  readonly object: DevAnnotatedObject;

  readonly id: string;
  readonly typeName: string | null;
  readonly instanceName: string | null;
  readonly color: string | null;
  readonly globalIndex: number;
  readonly instanceIndex: number | null;
  readonly createdAt: Date;
  readonly logs: Log[] = [];
  readonly consoleLogs: Log[] = [];
  readonly warnOnMultipleInstances: boolean;

  readonly typeLabel: string;
  readonly instanceLabel: string | null = null;
  readonly label: string = 'Unknown';

  readonly findTokens: string[] = [];

  mocker: any | null = null;

  trace(...params: any[]) {
    this.log(LogLevel.Trace, params);
  }

  debug(...params: any[]) {
    this.log(LogLevel.Debug, params);
  }

  info(...params: any[]) {
    this.log(LogLevel.Info, params);
  }

  warn(...params: any[]) {
    this.log(LogLevel.Warn, params);
  }

  error(...params: any[]) {
    this.log(LogLevel.Error, params);
  }

  private log(level: LogLevel, params: any[]) {
    const log = new Log(this.object, level, params);
    this.logs.push(log);

    if (logMatches(log)) {
      this.consoleLogs.push(log);
      log.sendToConsole();
    }

    return log;
  }
}