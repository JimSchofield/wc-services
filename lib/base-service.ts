/* eslint-disable @typescript-eslint/no-explicit-any */

type NotifyFn = (service: Service) => void;

export class Service {
  __subscribers = new Map<any, NotifyFn>();

  static notificationSet = new Set<any>();

  addSubscriber(subscriber: any, notifyFn: NotifyFn) {
    this.__subscribers.set(subscriber, notifyFn);

    return () => this.removeSubscriber(subscriber);
  }

  removeSubscriber(subscriber: any) {
    this.__subscribers.delete(subscriber);
  }

  async notify() {
    [...this.__subscribers.entries()].forEach(([subscriber, notifyFn]) => {
      if (Service.notificationSet.has(subscriber)) {
        return;
      }

      // console.log(`Notifying`, host, 'from', this);
      Service.notificationSet.add(subscriber);

      notifyFn(this);
    });

    // Clears the notifcation set after all notifications have been dispatched
    await 0;

    Service.notificationSet.clear();
  }

  /*
   * Overwrite to include teardown instructions.  Only called when services are reset through
   * the service provider class
   */
  destroy() {}
}
