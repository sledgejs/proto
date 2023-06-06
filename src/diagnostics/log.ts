import dayjs from 'dayjs';
import repeat from 'lodash/repeat';
import { callOrReturn } from '../core/typeUtils';
import { ConsoleWriter } from '../dev/consoleWriter';
import { DevAnnotatedObject, DefaultDevOptions } from '../dev/devSchema';
import { LogLevel } from './logSchema';

export class Log {

  constructor(obj: DevAnnotatedObject, level: LogLevel, params: any[]) {
    this.object = obj;
    this.level = level;
    this.dateTime = new Date();
    this.params = params;
  }

  readonly object: DevAnnotatedObject;
  readonly level: LogLevel;
  readonly dateTime: Date;
  readonly params: any[];

  sendToProvider() {

  }

  sendToConsole(target: Console = console): void {
    if (this.object._dev?.options.logLevel === null)
      return;

    const showTimestamp = true;

    const obj = this.object;
    const state = obj._dev;
    const opts = {
      ...DefaultDevOptions,
      ...state?.options
    };

    let color = callOrReturn(opts?.color);

    const gutterWidth = 50;
    const writer = new ConsoleWriter({
      level: this.level,
      baseStyle: {
        color: color
      },
      gutterWidth
    });

    let timestamp: string | undefined;
    let remGutterWidth = gutterWidth;

    if (showTimestamp) {
      timestamp = dayjs().format('HH:mm:ss.SSS');

      writer.push('[');
      writer.push(timestamp, { opacity: 0 });
      writer.push(']');

      remGutterWidth -= (timestamp.length + 2); // 2 from [ and ]
    }

    let typeLabel = state?.typeLabel ?? 'Unknown';
    let instLabel = state?.instanceLabel ?? '';

    // process the type label
    const typeLabelMaxLen = remGutterWidth - instLabel.length - 2;
    if (typeLabel.length > typeLabelMaxLen)
      typeLabel = typeLabel.slice(0, typeLabelMaxLen - 1) + '.';

    writer.push('[');
    writer.push(typeLabel, { bold: true });
    writer.push(instLabel, { bold: true, opacity: 0.8 });
    writer.push(']', {});

    remGutterWidth -= (typeLabel.length + instLabel.length + 2); // 2 from [ and ]

    // pad right
    writer.push(repeat(' ', remGutterWidth));

    // log the messages
    const { params } = this;
    const paramsLength = this.params.length;

    for (let i = 0; i < paramsLength; i++) {
      const param = params[i];
      writer.push(param);
      if (i < paramsLength - 1)
        writer.push(' ');
    }

    writer.send(target);
  }
}