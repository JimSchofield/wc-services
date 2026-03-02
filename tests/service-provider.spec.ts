import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import ServiceProvider from "../lib/service-provider";
import { Service } from "../lib/base-service";
import { SERVICE_PROVIDER_KEY } from "../lib/types";

describe("ServiceProvider", () => {
  let provider: ServiceProvider;

  beforeEach(() => {
    provider = new ServiceProvider();
  });

  afterEach(() => {
    provider.destroy();
  });

  test("registers itself on window[Symbol.for('service-provider')]", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any)[SERVICE_PROVIDER_KEY]).toBe(provider);
  });

  test("getService lazily instantiates a service", () => {
    class TestService extends Service {}

    const instance = provider.getService(TestService);

    expect(instance).toBeInstanceOf(TestService);
  });

  test("getService returns the same instance on subsequent calls", () => {
    class TestService extends Service {}

    const first = provider.getService(TestService);
    const second = provider.getService(TestService);

    expect(first).toBe(second);
  });

  test("setService registers a mock service", () => {
    class TestService extends Service {}
    const mock = new TestService();

    provider.setService(TestService, mock);

    expect(provider.getService(TestService)).toBe(mock);
  });

  test("setService throws if service already registered", () => {
    class TestService extends Service {}

    provider.getService(TestService);

    expect(() => provider.setService(TestService, new TestService())).toThrow(
      "Service already registered",
    );
  });

  test("destroyService calls destroy and removes the service", () => {
    class TestService extends Service {
      destroy = vi.fn();
    }

    const instance = provider.getService(TestService);
    provider.destroyService(TestService);

    expect(instance.destroy).toHaveBeenCalled();
    // Getting it again should create a new instance
    const newInstance = provider.getService(TestService);
    expect(newInstance).not.toBe(instance);
  });

  test("destroyService throws if service not registered", () => {
    class TestService extends Service {}

    expect(() => provider.destroyService(TestService)).toThrow(
      "Service is not registered",
    );
  });

  test("destroyAllServices destroys all services", () => {
    class ServiceA extends Service {
      destroy = vi.fn();
    }
    class ServiceB extends Service {
      destroy = vi.fn();
    }

    const a = provider.getService(ServiceA);
    const b = provider.getService(ServiceB);

    provider.destroyAllServices();

    expect(a.destroy).toHaveBeenCalled();
    expect(b.destroy).toHaveBeenCalled();
  });

  test("destroy clears services and removes from window", () => {
    class TestService extends Service {}
    provider.getService(TestService);

    provider.destroy();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any)[SERVICE_PROVIDER_KEY]).toBeUndefined();
  });
});
