import { nanoid } from 'nanoid';
import { DevAnnotatedObject } from '../dev/devSchema';
import { Kernel } from './kernel';

export interface Node 
  extends DevAnnotatedObject { }

export class Node
  implements DevAnnotatedObject {

  constructor(kernel: Kernel) {
    this.kernel = kernel;
  }

  readonly kernel: Kernel;
  readonly nodeId = nanoid();
}
