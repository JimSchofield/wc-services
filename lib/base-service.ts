type NotifyFn = (service: Service) => void;

export class Service {
  __subscribers = new Map<unknown, NotifyFn>();

  static notificationSet = new Set<unknown>();

  addSubscriber(subscriber: unknown, notifyFn: NotifyFn) {
    this.__subscribers.set(subscriber, notifyFn);

    return () => this.removeSubscriber(subscriber);
  }

  removeSubscriber(subscriber: unknown) {
    this.__subscribers.delete(subscriber);
  }

  notify() {
    for (const [subscriber, notifyFn] of this.__subscribers) {
      if (Service.notificationSet.has(subscriber)) {
        continue;
      }

      Service.notificationSet.add(subscriber);

      notifyFn(this);
    }

    queueMicrotask(() => {
      Service.notificationSet.clear();
    });
  }

  /*
   * Overwrite to include teardown instructions.  Only called when
   * services are reset through the service provider class
   */
  destroy() {}
}
