/* eslint-disable @typescript-eslint/no-explicit-any */

type SubscribeCb = (service: Service) => void;
type SubRecord = [any, SubscribeCb];

export class Service {
  __subscribers: Set<[any, SubscribeCb]> = new Set();

  static notificationSet = new Set<any>();

  addSubscriber(subscriber: any, notifyFn: SubscribeCb) {
    const subRecord: SubRecord = [subscriber, notifyFn];

    this.__subscribers.add(subRecord);

    return () => this.removeSubscriber(subRecord);
  }

  removeSubscriber(notifyFn: SubRecord) {
    this.__subscribers.delete(notifyFn);
  }

  async notify() {
    this.__subscribers?.forEach(([subscriber, notifyFn]) => {
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
