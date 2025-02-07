/* eslint-disable @typescript-eslint/no-explicit-any */
import { Constructor } from "./types";

type notifyFn = (service: InstanceType<Constructor>) => void;
type SubRecord = [any, notifyFn];

export class Service {
  static notificationSet = new Set<any>();
  __subscribers: SubRecord[] = [];

  addSubscriber(subscriber: any, notifyFn: notifyFn) {
    this.__subscribers.push([subscriber, notifyFn]);
  }

  removeSubscriber(subscriber: any) {
    this.__subscribers = this.__subscribers.filter(
      ([sub]) => sub !== subscriber,
    );
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

  destroy() {}
}
