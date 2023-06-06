import repeat from 'lodash/repeat';
import Color from 'color';
import { LogLevel } from '../diagnostics/logSchema';

const IntegerFormat = '';
const FloatFormat = '';

type ConsoleStyle = Partial<{
  color: string | null;
  opacity: number | null;
  bgColor: string | null;
  bgOpacity: number | null;
  bold: boolean | null;
  italics: boolean | null;
  size: number | null;
}>

type ConsoleTokenContent = string | number | boolean | symbol | object | RegExp;

enum ConsoleTokenType {
  Text = 'Text',
  Float = 'Float',
  Integer = 'Integer',
  Object = 'Object'
}

type ConsoleToken = {
  type: ConsoleTokenType;
  content: ConsoleTokenContent;
  label: string | null;
  style: ConsoleStyle | null;
  format: string | null;
}

type Props = {
  level: LogLevel;
  baseStyle?: ConsoleStyle;
  gutterWidth?: number;
}

/**
 * Utility for easily appending stylized logs to the console.
 */
export class ConsoleWriter {
  constructor(props: Props) {
    this.level = props.level;
    this.gutterWidth = props.gutterWidth ?? null;
    this.baseStyle = props.baseStyle ?? {};
  }

  level: LogLevel;
  gutterWidth: number | null = null;
  baseStyle: ConsoleStyle = {};

  private tokens: ConsoleToken[] = [];

  pop() {
    this.tokens.pop();
  }

  push(content: any, style?: ConsoleStyle, label?: string, format?: string) {

    let type = ConsoleTokenType.Object;
    if (typeof content === 'number') {
      if (Number.isInteger(content)) {
        type = ConsoleTokenType.Integer;
        format = format ?? IntegerFormat;
      } else {
        type = ConsoleTokenType.Float;
        format = format ?? FloatFormat;
      }
    } else if (typeof content === 'string') {
      type = ConsoleTokenType.Text;
    }

    const token: ConsoleToken = {
      type,
      content: content,
      style: style ?? null,
      format: format ?? null,
      label: label ?? null
    }

    this.tokens.push(token);
  }

  send(target: Console = console) {

    const args = this.getLogArgs();

    switch (this.level) {
      case LogLevel.Trace:
        target.log(...args);
        break;
      case LogLevel.Debug:
        target.debug(...args);
        break;
      case LogLevel.Info:
        target.info(...args);
        break;
      case LogLevel.Warn:
        target.warn(...args);
        break;
      case LogLevel.Error:
        target.error(...args);
        break;
    }
  }

  private getLogArgs() {

    const { tokens, baseStyle } = this;

    let msg = '';
    const args = [];
    const gutter = repeat(' ', this.gutterWidth ?? 0);

    let prevStyle: ConsoleStyle | null = null;
    let nextBreak = false;

    for (let token of tokens) {
      let { content, format, style, type } = token;

      if (!style)
        style = prevStyle;

      // set the previous style as it was defined on the token
      // before merging it with the default style
      // otherwise the behaviour of reusing previous styles only if the current one is not defined will not work properly
      prevStyle = style;

      let mergedStyle = {
        ...baseStyle,
        ...style
      };

      let css = getCssStyle(mergedStyle);

      if (nextBreak) {
        msg += '\n' + gutter;
        nextBreak = false;
      }

      msg += '%c';
      args.push(css);

      switch (type) {
        case ConsoleTokenType.Text:
          msg += content?.toString();
          break;

        case ConsoleTokenType.Integer:
          msg += `%${format}d`;
          args.push(content);
          break;

        case ConsoleTokenType.Float:
          msg += `%${format}f`;
          args.push(content);
          break;

        case ConsoleTokenType.Object:
          msg += `\n${gutter}%o`;
          args.push(content);
          nextBreak = true;
          break;
      }
    }

    return [msg, ...args];
  }
}


function getCssTokens(style: ConsoleStyle = {}) {

  const cssTokens: string[] = [];

  let color = style.color;
  const opacity = style.opacity ?? null;

  let bgColor = style.bgColor;
  const bgOpacity = style.bgOpacity ?? null;

  if (color && opacity) {
    color = Color(color)
      .alpha(opacity)
      .mix(Color('white'))
      .hex();
  }

  if (bgColor && bgOpacity) {
    color = Color(bgColor)
      .alpha(bgOpacity)
      .mix(Color('white'))
      .hex();
  }

  if (color)
    cssTokens.push(`color: ${color}`);
  if (bgColor)
    cssTokens.push(`background-color: ${bgColor}`);
  if (style.bold)
    cssTokens.push(`font-weight: bold`);
  if (style.italics)
    cssTokens.push(`font-style: italics`);
  if (style.size)
    cssTokens.push(`font-size: ${style.size}px`);

  return cssTokens;
}

function getCssStyle(style: ConsoleStyle = {}) {
  const tokens = getCssTokens(style);
  return tokens.join('; ');
}