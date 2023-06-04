import { ReactNode } from 'react';
import { Error } from '../../errors/error';

export type MemoContent = ReactNode | Error;

export enum MemoType {
  Info = 'Info',
  Success = 'Success',
  Error = 'Error',
  Warning = 'Warning'
}

export type MemoInfo = {
  type: MemoType;
  content: MemoContent;
}