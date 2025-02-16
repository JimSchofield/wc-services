# wc-services

This package provides a way to use services in all your wonderful web components, vanilla components, framework components, and more.

This is a work in progress. There will be many breaking changes and API changes.

## Installation

1. Run `npm i wc-services`
2. Add `<service-provider></service-provider>` on the main page of your application. Generally, putting it at the top of your `index.html` is fine, or at the root of your framework mount point.

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
        // Don't need to notify, as any setting calls `this.notify()`
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

## `lazyService` function

The `lazyService` function accepts four parameters

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

For a Lit component, there is a ReactiveController implemented. This reactive controller handles unsubscribing to the service and unsubscribing the component when disconnected:

```js
import { ServiceConsumer } from 'wc-services/lit';

export default MyComponent extends LitElement {
    constructor() {
        super();

        new ServiceConsumer(this, "myService", MyService);
    }

    // for Typescript
    declare myService: MyService;

    render() {
        //...
    }
}
```

For ergonomics, in Lit we have a decorator:

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

### Services can use services

If you need services to use other services, this is fine. For now, the way to make sure service services react is to use the callback `() => this.notify()`:

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

## Notes on Reactivity and Service lifecycle

Right now reactivity notifications are scheduled and multiple notifications are deduped. Also, to avoid circular dependency issues, services are lazily retrieved when they are accessed.

Services are meant to be long lived and should persist through the life of an application.

## Service Provider Class

The service provider class allows us to set up services without including the custom element on the page. This is useful in tests. It also provides some methods to set up mocks for services and a way to reset services. Example to come.
