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

### Services
Services are objects which persist for the lifetime of the Kernel and handle general-purpose activites like authentication, API connectivity, routing, page and component state management, vendor SDK management, etc.

Actual implementation of services will probably not exist in the framework, since most of the time they will be specific to the application, but guidelines will be offered.

A typical service configuration looks like:

| Service name          | Manages
| -                     | -
| `AuthService`         | Authorization and authentication
| `ApiService`          | API requests and communicates with the `AuthService` to obtain the required claims
| `RoutingService`      | Routing changes in the application and enables easy navigation between routes since this might be hindered with more modern routing frameworks
| `ComponentService`    | Persistent states for pages and components
| `VendorService`       | 3rd party SDK and library instances
| `EventService`        | Connections to external (or even internal) communication channels like WebSocket or BroadcastChannel
| `NotificationService` | UI and native notifications displayed to the user
| `ResourceService`     | Scripts and stylesheets loaded programatically
| `UiService`           | Everything related to the UI which does not belong in pages, components and the other services (keyboard and pointer events, fullscreen, page title, etc) 

#### Statically loaded services
Core services which most certainly will be used when loading the application should be instanced statically in the kernel, like this:

```ts
export class Kernel
  implements Node, DevAnnotatedObject {

  constructor() {
    // ...
    this.apiService = new ApiService(this);
    this.authService = new AuthService(this);
    // ...
  }

  // ...
  readonly apiService: ApiService;
  readonly authService: AuthService;
  // ...
}
```

#### Dynamically loaded services
Services which are not used when loading the application but might be used at a later time can by loaded dynamically, using a `ServiceLoader`, which can be implemented like this:

```
class ServiceLoader
```

Then they can be loaded in the Kernel using logic like this:

### Diagnostics

## Errors

### Error typing

Ideally errors should use the same class (just called `Error`) and each error should have a unique code assigned to it (either numerical or string based).

Different parts of the application can define their own codes (ideally namespaced), but all codes should be accessible from the same place (through an `ErrorCode` object, built from multiple error lookup objects).

An `Error` class is immutable and should use the following interface:

```ts
interface Error {
  new(code: ErrorCode, props: Props = {}): IError;

  readonly code: ErrorCode;
  readonly message: string;
  readonly displayHeading: string | null;
  readonly displayMessage: string;
  readonly source: any | null = null;
  readonly innerError: Error | null = null;
  readonly childErrors: Error[] = [];
}
```

The `source` field is used to store any kind of error which originates from outside the application logic, like native or 3rd party errors, which by design should be converted as soon as possible to a proper `Error` object.

When one `Error` object is derived from another `Error` object, the `innerError` field should be used instead of the `source`.

There should exist a special implementation called `ErrorGroup`, which is just an `Error` object with the code `ErrorGroup`, and child errors should be stored into the `childErrors` array. This allows returning of a single `Error` object when multiple errors where the cause, as it is with validation scenarios. The implementation can look like this:

```ts
class ErrorGroup
  extends Error {

  constructor(errors: Error[]) {
    super(ErrorCode.ErrorGroup);
    this.childErrors = errors;
  }
  
  readonly childErrors: Error[] = [];
}
```

`ErrorCode` should be an object built from all the local error sources in the application, as it is exemplified in the snippets.

There should be an `ErrorLookup` object based on the codes, where for each code there is an `ErrorDescriptor` object which describes the characteristics of the error. This allows for specifying only the code when creating an error, rather than the messages and other fields specific to the error.

Here is an example:

```ts

type ErrorDescriptor = {
  message?: string | null;
  displayHeading?: string | null;
  displayMessage?: string | null;
  canBeUserTriggered?: boolean | null;
  // ...
}

const ErrorLookup = withTypedKeysErrorLookup({
  ...ApiErrorLookup,
  ...AuthErrorLookup,
  
  ErrorGroup: {
    message: `Multiple errors have occurred.`
  },

  Aborted: {
    message: `The request was aborted.`,
    displayMessage: `The operation was interrupted.`
  },
  
  Timeout: {
    message: `The request timed out.`,
    displayMessage: `The operation timed out.`
  }
});
```

### Error handling

Sledge uses an error handling mechanism inspired from Golang (https://go.dev/blog/error-handling-and-go) in which each operation which can return an Error should return a tuple which can take one of the following forms:

- `[value]` or `[value, null]` for operations which succeeded and returned a value
- `[null, error]` for operation which failed and returned an Error

These tuples are called results and the synchronous and asynchronous types look like this:

```
export type Result<TValue = true, TError extends Error = Error> =
  [TValue] |
  [TValue, null] |
  [null, TError];

export type AsyncResult<TValue = true, TError extends Error = Error> =
  Promise<Result<TValue, TError>>;
```

An operation which does not return a particular value should just return `true`, hence the default value for the generic type parameter.

The typical pattern for handling such a response in an asynchronous operation is the following (synchronous is very similar, only without the `await`):

```ts
const [val, err] = await runAsyncOperation(...args);

if (err) {
  // handle error
  // if the error is unrecoverable, just return the same or another error
  // if the error is recoverable, try to recover and return another result based on that
  
  // a return is almost always necessary since it doesn't make sense to
  // continue and also process the value which will be null anyways
  // also notice that a Result is returned
  return [null, err];
}

// process the result
// if no error occurred, it should be assumed that `val` is not null or undefined
```





