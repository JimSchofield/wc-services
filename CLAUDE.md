# wc-services

A lightweight service layer for web components (vanilla, Lit, or any framework). Published as `wc-services` on npm.

## Architecture

### Core Concepts

- **ServiceProvider**: Singleton registry stored on `window[Symbol.for('service-provider')]`. Lazily instantiates services on first access and caches them. Can also be used as a custom element (`<service-provider>`). Access via `getServiceProvider()` helper from `lib/types.ts`.
- **Service** (base class in `lib/base-service.ts`): Base class for all services. Has a subscriber/notification system. Subscribers are deduped per microtask via a static `notificationSet`. Has a `destroy()` hook for teardown.
- **`lazyService()`** (`lib/service.ts`): Wires up a service to a host object using a lazy property (defined via `Object.defineProperty` getter that replaces itself on first access). Auto-subscribes host to service notifications. When host is also a Service, auto-wires `notify()` propagation.
- **`service()`** (`lib/service.ts`): Eagerly retrieves and subscribes to a service (non-lazy version).
- **`@reactive`** decorator (`lib/decorators/reactive.ts`): Makes a Service property auto-call `this.notify()` on set. Requires `useDefineForClassFields: false` in tsconfig.

### Lit Integration (`lib/lit/`)

- **ServiceController**: Lit `ReactiveController` that uses `lazyService` and calls `host.requestUpdate()` on notify. Handles `hostDisconnected` cleanup.
- **`@service` decorator** (`lib/lit/service-decorator.ts`): Lit decorator using `addInitializer` to create a `ServiceController` per element instance.

### Key Files

- `lib/base-service.ts` - Service base class with pub/sub
- `lib/service.ts` - `service()` and `lazyService()` functions
- `lib/service-provider.ts` - ServiceProvider class + custom element
- `lib/types.ts` - `ConstructorFrom<T>` type + global Window augmentation
- `lib/util/lazyProperty.ts` - Self-replacing lazy getter utility
- `lib/lit/` - Lit-specific integration (controller + decorator)
- `lib/decorators/` - Framework-agnostic decorators (`@reactive`)
- `examples/` - Demo app with products/cart services

### Export Paths

- `wc-services` - core (lazyService, Service, ServiceProvider)
- `wc-services/lit` - Lit integration (ServiceController, @service)
- `wc-services/decorators` - decorators (@reactive)

## Build & Dev

- Uses Vite + TypeScript, `vite-plugin-dts` for declarations
- `pnpm dev` / `pnpm build`
- No test runner configured yet (tests dir exists with `initial.spec.ts`)

## Current Branch

- `testing-window-provider` - working on changes to service provider and lazy instantiation
