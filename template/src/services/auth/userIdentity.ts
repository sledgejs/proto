import { Kernel } from '../../kernel/kernel';
import { Node } from '../../kernel/node';

type Source = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export class UserIdentity
  extends Node {

  constructor(kernel: Kernel, source: Source) {
    super(kernel);

    this.id = source.id;
    this.source = source;
  }

  readonly id: string;
  readonly source: Source;

  get email(): string | null {
    return this.source.email ?? null;
  }

  get firstName(): string | null {
    return this.source.firstName ?? null;
  }
  
  get lastName(): string | null {
    return this.source.lastName ?? null;
  }
}