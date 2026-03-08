import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import ServiceProvider from "../lib/service-provider";
import { Service } from "../lib/base-service";
import { getService, lazyService } from "../lib/service";
import { getServiceProvider } from "../lib/types";
import { reactive } from "../lib/decorators/reactive";
import { service as serviceToService } from "../lib/decorators/service-to-service";

describe("Integration", () => {
  let provider: ServiceProvider;

  beforeEach(() => {
    provider = new ServiceProvider();
  });

  afterEach(() => {
    provider.destroy();
  });

  test("a component using lazyService can access a service", () => {
    class CounterService extends Service {
      count = 0;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const host: Record<string, any> = {};
    lazyService(host, "counter", CounterService);

    expect(host.counter).toBeInstanceOf(CounterService);
    expect(host.counter.count).toBe(0);
  });

  test("two components subscribing to the same service both get notified", () => {
    class SharedService extends Service {}

    const notify1 = vi.fn();
    const notify2 = vi.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const host1: Record<string, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const host2: Record<string, any> = {};

    lazyService(host1, "shared", SharedService, notify1);
    lazyService(host2, "shared", SharedService, notify2);

    // Access to trigger lazy initialization
    void host1.shared;
    void host2.shared;

    host1.shared.notify();

    expect(notify1).toHaveBeenCalled();
    expect(notify2).toHaveBeenCalled();
  });

  test("@reactive decorator auto-notifies subscribers on property set", async () => {
    class ReactiveService extends Service {
      @reactive value = "initial";
    }

    const callback = vi.fn();
    const instance = provider.getService(ReactiveService);
    instance.addSubscriber("test", callback);

    instance.value = "updated";

    expect(callback).toHaveBeenCalled();
    expect(instance.value).toBe("updated");
  });

  test("a service using another service via lazyService propagates notifications", async () => {
    class InnerService extends Service {
      @reactive data = "hello";
    }

    class OuterService extends Service {
      constructor() {
        super();
        lazyService(this, "inner", InnerService);
      }
      declare inner: InnerService;
    }

    const outerCallback = vi.fn();
    const outer = provider.getService(OuterService);
    outer.addSubscriber("test", outerCallback);

    // Access inner to trigger lazy init (which auto-wires notify propagation)
    outer.inner.data = "world";

    // Wait for microtask to clear
    await new Promise((resolve) => queueMicrotask(resolve));

    // OuterService should have been notified because inner's notify propagates to outer
    expect(outerCallback).toHaveBeenCalled();
  });

  test("getServiceProvider returns the registered provider", () => {
    expect(getServiceProvider()).toBe(provider);
  });

  test("lazyService property is only initialized on first access", () => {
    class TestService extends Service {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const host: Record<string, any> = {};
    lazyService(host, "svc", TestService);

    // Service not yet in the provider's map
    expect(provider.services.has(TestService)).toBe(false);

    // Access triggers initialization
    void host.svc;
    expect(provider.services.has(TestService)).toBe(true);
  });

  test("circular service chain does not loop forever and consumer is notified only once", () => {
    class ServiceA extends Service {
      constructor() {
        super();
        lazyService(this, "b", ServiceB);
      }
      declare b: ServiceB;
    }

    class ServiceB extends Service {
      constructor() {
        super();
        lazyService(this, "a", ServiceA);
      }
      declare a: ServiceA;
    }

    const a = provider.getService(ServiceA);
    const b = provider.getService(ServiceB);

    // Trigger lazy init so the circular subscriptions are wired up
    void a.b;
    void b.a;

    const consumerCallback = vi.fn();
    a.addSubscriber("consumer", consumerCallback);

    // This would loop forever without dedup: A notifies B, B notifies A, ...
    a.notify();

    // Consumer should be notified exactly once
    expect(consumerCallback).toHaveBeenCalledTimes(1);
  });

  test("consumer subscribed to multiple services is notified only once per notification batch", () => {
    class ServiceA extends Service {}
    class ServiceB extends Service {}

    const consumer = { name: "consumer" };
    const callback = vi.fn();

    const a = provider.getService(ServiceA);
    const b = provider.getService(ServiceB);

    a.addSubscriber(consumer, callback);
    b.addSubscriber(consumer, callback);

    // Both services notify in the same microtask
    a.notify();
    b.notify();

    // Consumer should only be notified once due to dedup
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("getService returns a service instance without subscribing", () => {
    class TestService extends Service {
      @reactive value = "hello";
    }

    const instance = getService(TestService);

    expect(instance).toBeInstanceOf(TestService);
    expect(instance.value).toBe("hello");
    // No subscribers were added
    expect(instance.__subscribers.size).toBe(0);
  });

  test("getService returns the same singleton as service/lazyService", () => {
    class TestService extends Service {}

    const fromGetService = getService(TestService);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const host: Record<string, any> = {};
    lazyService(host, "svc", TestService);
    const fromLazy = host.svc;

    expect(fromGetService).toBe(fromLazy);
  });

  test("service-to-service: when host is a Service, notify is auto-wired without explicit callback", async () => {
    class ChildService extends Service {
      @reactive value = 0;
    }

    class ParentService extends Service {
      constructor() {
        super();
        lazyService(this, "child", ChildService);
      }
      declare child: ChildService;
    }

    const parentCallback = vi.fn();
    const parent = provider.getService(ParentService);
    parent.addSubscriber("test", parentCallback);

    // Access child to trigger lazy init
    parent.child.value = 42;

    await new Promise((resolve) => queueMicrotask(resolve));

    expect(parentCallback).toHaveBeenCalled();
    expect(parent.child.value).toBe(42);
  });

  test("@serviceToService auto-wires notify and propagates changes", async () => {
    class DepService extends Service {
      @reactive value = "initial";
    }

    class HostService extends Service {
      @serviceToService(DepService)
      declare dep: DepService;
    }

    const hostCallback = vi.fn();
    const host = provider.getService(HostService);
    host.addSubscriber("test", hostCallback);

    host.dep.value = "changed";

    await new Promise((resolve) => queueMicrotask(resolve));

    expect(hostCallback).toHaveBeenCalled();
    expect(host.dep.value).toBe("changed");
  });

  test("@serviceToService tears down subscription on destroy", () => {
    class DepService extends Service {
      @reactive value = 0;
    }

    class HostService extends Service {
      @serviceToService(DepService)
      declare dep: DepService;
    }

    const host = provider.getService(HostService);
    const dep = host.dep;

    expect(dep.__subscribers.size).toBe(1);

    host.destroy();

    expect(dep.__subscribers.size).toBe(0);
  });

  test("@serviceToService chains destroy with existing destroy logic", () => {
    class DepService extends Service {}

    const customDestroy = vi.fn();

    class HostService extends Service {
      @serviceToService(DepService)
      declare dep: DepService;

      destroy() {
        customDestroy();
      }
    }

    const host = provider.getService(HostService);
    void host.dep; // trigger lazy init

    host.destroy();

    expect(customDestroy).toHaveBeenCalled();
  });
});
