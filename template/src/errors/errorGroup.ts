import { Error } from './error';
import { ErrorCode } from './errorCode';

/**
 * Special implementation of {@link Error} which consists of 
 * a group of multiple inner errors.
 * Used mostly for scenarios in which multiple errors can occur at the same time,
 * as it is the case with validation, for example.
 */
export class ErrorGroup
  extends Error {

  /**
   * Creates a new instance of the {@link ErrorGroup} class using the
   * provided array of inner errors.
   * @param errors The array of inner errors.
   */
  constructor(errors: Error[]) {
    super(ErrorCode.ErrorGroup);
    this.childErrors = errors;
  }

  /** 
   * The array of inner errors of the group.
   */
  readonly childErrors: Error[] = [];
}