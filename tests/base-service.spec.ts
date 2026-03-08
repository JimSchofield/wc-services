import { describe, test, expect, vi } from "vitest";
import { Service } from "../lib/base-service";

describe("Service", () => {
  test("addSubscriber registers a subscriber and returns unsubscribe fn", () => {
    const service = new Service();
    const callback = vi.fn();

    const unsubscribe = service.addSubscriber("host", callback);

    service.notify();
    expect(callback).toHaveBeenCalledWith(service);

    unsubscribe();
    callback.mockClear();

    service.notify();
    expect(callback).not.toHaveBeenCalled();
  });

  test("removeSubscriber removes a subscriber", () => {
    const service = new Service();
    const callback = vi.fn();

    service.addSubscriber("host", callback);
    service.removeSubscriber("host");

    service.notify();
    expect(callback).not.toHaveBeenCalled();
  });

  test("notify calls all subscriber callbacks", () => {
    const service = new Service();
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    service.addSubscriber("host1", cb1);
    service.addSubscriber("host2", cb2);

    service.notify();

    expect(cb1).toHaveBeenCalledWith(service);
    expect(cb2).toHaveBeenCalledWith(service);
  });

  test("notify dedupes notifications for the same subscriber within a microtask", () => {
    const service = new Service();
    const callback = vi.fn();

    service.addSubscriber("host", callback);

    service.notify();
    service.notify();

    // First call notifies, second is deduped
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("notify allows notifications again after microtask clears", async () => {
    const service = new Service();
    const callback = vi.fn();

    service.addSubscriber("host", callback);

    service.notify();
    expect(callback).toHaveBeenCalledTimes(1);

    // Wait for microtask to clear the notification set
    await new Promise<void>((resolve) => queueMicrotask(resolve));

    service.notify();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("destroy is callable and is a no-op by default", () => {
    const service = new Service();
    expect(() => service.destroy()).not.toThrow();
  });
});
