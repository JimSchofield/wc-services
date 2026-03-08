# wc-services

his package provides a way to use services in all your wonderful web components, vanilla components, framework components, and more.

Features:

- Services are only created when first accessed, not at registration time (lazy!)
- Works with vanilla web components, Lit, anywhere!
- Batches notification updates for efficient reactivity
- The `@reactive` decorator turns service properties into auto-notifying setters with zero boilerplate
- The `@service` decorators make subscribing with vanilla web components, lit web components, or just other services easy
- Services can subscribe to other services with automatic lifecycle management
- Build in service support

This is a work in progress. There will be many breaking changes and API changes.

## Installation

1. Run `npm i wc-services`
2. Call `ServiceProvider.setup()` at the entry point of your application before any components are created

## Guide

### `Service` class

To create a service, extend the `Service` class:

```js
export default MyService extends Service {
    ...
}
```

In your services, to let components know if there's been a state change you will need to call `this.notify()`:

```js
export default MyService extends Service {
    text = "foo";

    changeText() {
        this.text = "bar";
        this.notify();
    }
}
```

To make properties feel reactive, it's recommended to call notify when a property is set. Here is an example:

```js
export default MyService extends Service {
    _text = "foo";

    get text() {
        return text;
    }

    set text(val) {
        this.text = val;
        this.notify();
    }

    changeText() {
        // Don't need to notify here, as the setter above calls `this.notify()`
        this.text = "bar";
    }
}
```

A convenience decorator `@reactive` cuts down on the boilerplate if you have decorators available:

```js
export default MyService extends Service {
    @reactive text = "foo";

    changeText() {
        this.text = "bar";
    }
}
```

> **NOTE**: You must have `"useDefineForClassFields": false,` set in your typescript configuration for this decorator to work

## Suscribing to a service:

### `lazyService` function

The `lazyService` function sets up a service as a property on your component. The service is not instantiated until the host component actually accesses the property. It accepts four parameters

1. `host: any` - the host that is calling for the service
2. `class: Constructor` - The class definition for the service you want to get
3. `property: ProperyKey` - The property on the host that the store should be saved to
4. `notify: () => void` - An callback called when the service updates

For example, in a vanilla web component, it may look like this:

```js
export default MyComponent extends HTMLElement {
    constructor() {
        super();

        lazyService(this, "myService", MyService, () => this.update());
        // This property is now available as `this.myService`
    }

    update() {
        // called when myService notifies that state has changed
    }
}
```

### Subscribing in a vanilla web component

For ergonomics, if you have decorators available, there is a `@service` decorator for vanilla web components. It sets up the service subscription on connect and tears it down on disconnect:

```ts
import { service } from "wc-services/decorators";

export default MyComponent extends HTMLElement {
    @service(MyService, (host) => host.update())
    declare myService: MyService;

    update() {
        // called when myService notifies that state has changed
    }
}
```

### Subscribing in a Lit web component

We also have Lit we have a decorator which handles setup and teardown using a lit controller.

```ts
import { service } "wc-services/lit";

export default MyComponent extends LitElement {
    @service(MyService)
    declare myService: MyService;

    render() {
        //...
    }
}
```

### Subscribing in another service

```js
export default MyService extends Service {
    constructor() {
        super();

        lazyService(this, "otherService", OtherService);
    }

    text = "foo";

    changeText() {
        this.text = "bar";
        this.notify();
    }
}
```

Note that `lazyService` is aware when it's being attached to a service and doesn't need to be provided a notify function.

There is also a decorator for subscribing in another service:

```ts
import { service } from "wc-services/service";

export default MyService extends Service {
    @service(OtherService)
    declare otherService: OtherService;

    changeText() {
        this.text = "bar";
        this.notify();
    }
}
```

The decorator automatically subscribes to the other service and calls `this.notify()` when it changes. It also cleans up the subscription when the host service is destroyed.

## Notes on Reactivity and Service lifecycle

Right now reactivity notifications are scheduled and multiple notifications are deduped. Also, to avoid circular dependency issues, services are lazily retrieved when they are accessed.

It's important to note that each consumer of services will be notified once from a service if there is a notification, but we aren't guaranteed to be notified by the service where the notification came from.

```
  Service A          Service B          Service C
  (Change!)             │                  │
     │                  │                  │
     │  notify()        │                  │
     ├───────────────>>>┤                  │
     │                  │  notify()        │
     │                  ├───────────────>>>┤
     │                  │                  │
     ▼                  ▼                  ▼
  ┌─────────────────────────────────────────────┐
  │             Notification Dedup              │
  │                                             │
  │    (Check to make sure the consumer/host    │
  │        hasn't already been notified.        │
  │                     If not, notify!)        │
  │                                             │
  └─────────────────────────────────────────────┘
                      │
                      ▼
               ┌─────────────┐
               │  Consumer   │
               │             │
               │  notified   │
               │  once, but  │
               │  which      │
               │  service?   │
               └─────────────┘
```

In the example above, Service A notifies Service B, which then notifies Service C. The consumer is subscribed to all three. Even though all three services triggered notifications, the consumer is only called once — and it may be from any of the three. The consumer should treat a notification as "something changed" rather than "this specific service changed."

## Service Provider Class

The `ServiceProvider` manages all service instances. Call `ServiceProvider.setup()` at the entry point of your application. It also provides methods to set up mocks for services and a way to reset services, which is useful in tests. See the test files to see this in action.
