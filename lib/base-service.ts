/* eslint-disable @typescript-eslint/no-explicit-any */

type notifyFn = (service: Service) => void;
type SubRecord = [any, notifyFn];

export class Service {
  /*
   * Used only to signify that there is new state to consume or react to
   * Specifically, this is used internally with `useService` in react
   */
  __stateChanges = true;

  __subscribers: SubRecord[] = [];

  static notificationSet = new Set<any>();

  addSubscriber(subscriber: any, notifyFn: notifyFn) {
    this.__subscribers.push([subscriber, notifyFn]);
  }

  removeSubscriber(subscriber: any) {
    this.__subscribers = this.__subscribers.filter(
      ([sub]) => sub !== subscriber,
    );
  }

  async notify() {
    this.__stateChanges = true;

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
