# wc-services

This package provides a system to provide services to all your wonderful web components, vanilla components, framework components, and more.

This is a work in progress.  There will be many breaking changes and API changes.

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
> **NOTE**: You must have `"useDefineForClassFields": false,` for this decorator to work

## `service` function

The `service` function accepts three parameters

1. `host: any` - the host that is calling for the service 
2. `class: Constructor` - The class definition for the service you want to get
3. `notify: () => void` - A callback called when the service updates

For example, in a vanilla web component, it may look like this:
```js
export default MyComponent extends HTMLElement {
    myService = service(this, MyService, () => this.update());

    update() {
        //... updates after state changes
    }
}
```

For a Lit component, it would look like this:
```js
export default MyComponent extends LitElement {
    myService = service(this, MyService, () => this.requestUpdate());

    render() {
        //...
    }
}
```

For Lit components we have a decorator to simplify this:
```ts
export default MyComponent extends LitElement {
    @serviceLit(MyService)
    declare myService: MyService;

    render() {
        //...
    }
}
```

### Services can use services

If you need services to use other services, this is fine.  For now, the way to make sure service services react is to use the callback `() => this.notify()`:

```js
export default MyService extends Service {
    otherService = service(this, OtherService, () => this.notify());

    text = "foo";

    changeText() {
        this.text = "bar";
        this.notify();
    }
}
```

## Notes on Reactivity

Right now reactivity notifications are scheduled and multiple notifications are deduped.  This should remove any chance of circular dependencies or multiple calls to re-render by services.

## Service Provider Class

The service provider class allows us to set up services without including the custom element on the page.  This is useful in tests.  It also provides some methods to set up mocks for services and a way to reset services.  Example to come.
