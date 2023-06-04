import { Error } from './error';
import { ErrorCode } from './errorCode';

export class ErrorGroup
  extends Error {

  constructor(errors: Error[]) {
    super(ErrorCode.ErrorGroup);
    this.childErrors = errors;
  }
  
  readonly childErrors: Error[] = [];
}