import { nanoid } from 'nanoid';
import { DevAnnotatedObject } from '../dev/devSchema';
import { Kernel } from './kernel';

export interface Node 
  extends DevAnnotatedObject { }

/**
 * A Node is any object in the application which keeps a reference to the Kernel. It should be really lightweight, ideally doing the following:
 * 
 * - Receiving and storing the reference to the Kernel through its constructor 
 * - Initializing debugging utilities
 * - Assigning an internal unique ID which can then be used for diagnostics or used as a key if needed 
 */
export class Node
  implements DevAnnotatedObject {

  /**
   * Creates a new instance of the {@link Node} class.
   * @param kernel The {@link Kernel} to be referenced by this `Node`.
   */
  constructor(kernel: Kernel) {
    this.kernel = kernel;
  }

  /**
   *  The {@link Kernel} which is referenced by this `Node`.
   */
  readonly kernel: Kernel;

  /**
   * The locally unique ID of this node.
   * Should be use for diagnostics or it can be used as a key if needed.
   */
  readonly nodeId = nanoid();
}