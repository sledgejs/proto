import { ReactNode } from 'react';
import { Error } from '../../errors/error';

export type MemoContent = ReactNode | Error;

/**
 * The type of message to display in a {@link Memo} component.
 */
export enum MemoType {
  Info = 'Info',
  Success = 'Success',
  Error = 'Error',
  Warning = 'Warning'
}

/**
 * The information to display in a {@link Memo} component.
 */
export type MemoInfo = {

  /**
   * The type of the message to display.
   */
  type: MemoType;

  /**
   * The content of the message to display.
   */
  content: MemoContent;
}