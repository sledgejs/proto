
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