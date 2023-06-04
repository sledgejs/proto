# Sledge Prototype (Draft)

## Architecture
---

### Kernel
The central part of any application is the Kernel. It contains references to the application configuration, loaders, all services and indirectly it might contain references to some or all component states, but this is not required.

All objects in the application except core utilities or some lightweight data objects should keep a reference to the Kernel.

The Kernel serves the following purposes:

- It is a central hub through which all objects can communicate and get references to other objects, either directly or through message passing
- It acts as a place to store data and logic not directly related to specific pages or components. This should be done mostly through Services
- It can be exposed in testing and development mode for debugging and mocking

### Nodes
A Node is any object in the application which keeps a reference to the Kernel. It should be really lightweight, ideally doing the following:

- Receiving and storing the reference to the Kernel through its constructor 
- Initializing debugging utilities
- Assigning an internal unique ID which can then be used for diagnostics or used as a key if needed 

Current implementation of the base Node class is:

```ts
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

```

The `DevAnnotatedObject` interface is explained in the [Diagnostics](#diagnostics) section.

`nanoid` package is used since it generates short unique IDs, ideal for internal / local scenarios.
